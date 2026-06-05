#Numax easytimepro start-----------------------
import requests
import random
from django.conf import settings
from django.core.cache import cache

class EasyTimeClient:
    def __init__(self):
        self.base_url = settings.EASYTIME_BASE_URL
        self.auth_url = f"{self.base_url}{settings.EASYTIME_AUTH_URL}"
        
        self.employee_url = f"{self.base_url}/personnel/api/employees/"
        self.dept_url = f"{self.base_url}/personnel/api/departments/"
        self.area_url = f"{self.base_url}/personnel/api/areas/"
        self.terminal_action_url = f"{self.base_url}/iclock/api/terminals/action/"
        self.terminals_list_url = f"{self.base_url}/iclock/api/terminals/"
        
        self.unlock_url = f"{self.base_url}/iclock/api/terminals/unlock_terminal/"
        self.enroll_url = f"{self.base_url}/iclock/api/terminals/enroll_remotely/"

    def get_headers(self):
        token = cache.get('easytime_token')
        if not token:
            print("Token expired. Logging in...")
            token = self.login()
        return {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}

    def login(self):
        try:
            payload = {"username": settings.EASYTIME_USERNAME, "password": settings.EASYTIME_PASSWORD}
            response = requests.post(self.auth_url, json=payload)
            response.raise_for_status()
            token = response.json().get('token')
            cache.set('easytime_token', token, timeout=86400)
            return token
        except Exception as e:
            print(f"Auth Error: {e}")
            return None

    # --- HELPERS ---
    def get_id_by_name(self, endpoint, name):
        if not name: return None
        headers = self.get_headers()
        try:
            url = f"{self.base_url}{endpoint}?search={name}"
            res = requests.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json().get('data', [])
                for item in data:
                    key = 'dept_name' if 'departments' in endpoint else 'area_name'
                    if item.get(key, '').lower() == name.lower():
                        return item['id']
        except: pass
        return None

    def get_id_by_index(self, endpoint, index=0):
        headers = self.get_headers()
        try:
            limit = index + 1
            url = f"{self.base_url}{endpoint}?page_size={limit}"
            res = requests.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json().get('data', [])
                if len(data) > index: return data[index]['id']
                elif data: return data[0]['id']
        except: pass
        return 1

    def get_terminal_id_by_sn(self, sn):
        headers = self.get_headers()
        try:
            res = requests.get(f"{self.terminals_list_url}?sn={sn}", headers=headers)
            if res.status_code == 200:
                data = res.json().get('data', [])
                if data: return data[0]['id']
        except: pass
        return None

    def get_employee_internal_id(self, emp_code):
        headers = self.get_headers()
        try:
            res = requests.get(f"{self.employee_url}?emp_code={emp_code}", headers=headers)
            if res.status_code == 200:
                data = res.json().get('data', [])
                if data: return data[0]['id']
        except: pass
        return None
    
    
    # --- NEW: GET USER AREAS (For Audit) ---
    def get_user_areas(self, emp_code):
        internal_id = self.get_employee_internal_id(emp_code)
        if not internal_id: return []
        headers = self.get_headers()
        try:
            res = requests.get(f"{self.employee_url}{internal_id}/", headers=headers)
            if res.status_code == 200:
                # EasyTimePro returns areas as a list of IDs, e.g., [1, 5, 9]
                return res.json().get('area', [])
        except: pass
        return []

    # --- AUTO CREATE ---
    def ensure_department(self, name):
        if not name: return 1
        eid = self.get_id_by_name('/personnel/api/departments/', name)
        if eid: return eid
        headers = self.get_headers()
        code = f"D_{random.randint(1000, 9999)}"
        try:
            # res = requests.post(self.dept_url, json={"dept_code": code, "dept_name": name, "parent_dept": 1}, headers=headers)
            # Note: parent_dept as empty string works for root in some versions
            res = requests.post(self.dept_url, json={"dept_code": code, "dept_name": name, "parent_dept": ""}, headers=headers)
            if res.status_code == 201: return res.json().get('id')
        except: pass
        return 1

    def ensure_area(self, name):
        if not name: return 1
        eid = self.get_id_by_name('/personnel/api/areas/', name)
        if eid: return eid
        headers = self.get_headers()
        code = f"A_{random.randint(1000, 9999)}"
        try:

            # res = requests.post(self.area_url, json={"area_code": code, "area_name": name, "parent_area": 1}, headers=headers)
            # --- FIX: Use 0 for Root Level (No Parent) based on Schema ---
            payload = {
                "area_code": code, 
                "area_name": name, 
                "parent_area": ''  # Using empty string for Root Level
            }
            res = requests.post(self.area_url, json=payload, headers=headers)
            # if res.status_code == 201: return res.json().get('id')
        # except: pass
            if res.status_code == 201: 
                    return res.json().get('id')
            else:
                print(f"⚠️ Failed to create Area '{name}': {res.text}")
                
        except Exception as e: 
            print(f"❌ Error creating area: {e}")
            pass
        return 1

    # --- MAIN LOGIC (PROVISIONING WITH MERGE) ---

    def provision_employee_to_device(self, bio_user, serial_number, area_ids=None, dept_id=None):
        """
        1. VALIDATE: Check Device.
        2. DATA: Get details.
        3. FETCH EXISTING: Get current server areas to avoid overwrite.
        4. MERGE: Combine Dojo Areas + Server Areas.
        3. GLOBAL SYNC: Update User.
        4. BIO-PUSH: Force Face/Finger to Device.
        """
        if not serial_number: return {"status": "error", "message": "No Serial Number"}

        # --- STEP 1: VALIDATE DEVICE ---
        term_id = self.get_terminal_id_by_sn(serial_number)
        if not term_id:
            return {"status": "error", "message": f"Device {serial_number} not found."}

        # --- STEP 2: GET DATA ---
        # from ..models import MasterTable
        from django.apps import apps
        MasterTable = apps.get_model('app1', 'MasterTable')
        BiometricDevice = apps.get_model('app1', 'BiometricDevice') # <--- NEW IMPORT

        try:
            mt = MasterTable.objects.get(emp_id=bio_user.employeeid)
            dept_name = mt.department.department_name if mt.department else ""
            mobile = mt.phone if (mt.phone and len(mt.phone) >= 10) else None
            gender = mt.sex
            # hire = str(mt.date_of_joining)
        except:
            dept_name, mobile, gender = "", None, "M"
            # dept_name, mobile, gender, hire = "", None, "M", "2025-01-01"

        # --- STEP 3: RESOLVE IDs ---
        if not dept_id:
            dept_id = self.ensure_department(dept_name)
        pos_id = self.get_id_by_index('/personnel/api/positions/', index=0)

        # --- STEP 4: PREPARE DOJO AREAS ---
        # 4. DYNAMIC DOJO AREAS
        dojo_target_areas = []

        # A. Find the "Dojo Enrollment Device" Area ID dynamically
        try:
            enroll_dev_obj = BiometricDevice.objects.filter(is_enrollment_device=True).first()
            
            if enroll_dev_obj:
                term_data = requests.get(f"{self.terminals_list_url}?sn={enroll_dev_obj.serial_number}", headers=self.get_headers()).json()
                
                if term_data.get('data') and len(term_data['data']) > 0:
                    raw_area = term_data['data'][0].get('area')
                    
                    # --- FIX: Handle Object vs Integer ---
                    enroll_area_id = None
                    if isinstance(raw_area, dict):
                        enroll_area_id = raw_area.get('id') # Extract ID from object
                    elif isinstance(raw_area, int):
                        enroll_area_id = raw_area # It is already an ID
                    
                    if enroll_area_id:
                        dojo_target_areas.append(enroll_area_id)
                        print(f"   ℹ️  Auto-detected Enrollment Area: {enroll_area_id} (from {enroll_dev_obj.name})")
                    else:
                        print("   ⚠️  Device found but has no Area assigned. Defaulting to 1.")
                        dojo_target_areas.append(1) # <--- Change 1 to 13(defuilt dojoroom id if needed) if you prefer
                else:
                    dojo_target_areas.append(1) # <--- Change 1 to 13 if you prefer
            else:
                dojo_target_areas.append(1) # <--- Change 1 to 13 if you prefer

        except Exception as e:
            print(f"   ⚠️  Dynamic Area Lookup Failed: {e}")
            dojo_target_areas.append(1)# <--- Change 1 to 13 if you prefer

        # [CONFIG] ONE Default Area: The Dojo Enrollment Room (ID 11)
        # This ensures every user can enter the room to get enrolled.
        # DOJO_ROOM_ID = 13  #DojoRoom device(Area) id
        # dojo_target_areas.append(DOJO_ROOM_ID)
        
        # B. Add Specific Areas (Skill Matrix)
        if area_ids:
            # Handle list or int
            ids_to_check = area_ids if isinstance(area_ids, list) else [area_ids]
            for aid in ids_to_check:
                # Only add if not 1 and not already in list
                if aid != 1 and aid not in dojo_target_areas:
                    # target_areas.append(aid)
                    dojo_target_areas.append(aid)

        # --- STEP 5: FETCH & MERGE (CRITICAL FIX) ---
        # 1. Fetch what is currently on the server
        existing_server_data = self.get_user_areas(bio_user.employeeid)

        # 2. Start with existing areas so we don't lose them
        # EXTRACT IDS ONLY (The Fix)
        # The server returns objects [{'id':14, ...}], but we need [14]
        existing_ids = []
        for item in existing_server_data:
            if isinstance(item, dict):
                # If it's an object, grab the 'id'
                if 'id' in item:
                    existing_ids.append(item['id'])
            elif isinstance(item, int):
                # If it's already an ID, keep it
                existing_ids.append(item)
            elif isinstance(item, str) and item.isdigit():
                 existing_ids.append(int(item))

        # 3. Start with cleaned existing IDs
        final_area_list = list(existing_ids)


        # 4. Append new Dojo areas if they aren't already there
        for new_area in dojo_target_areas:
            if new_area not in final_area_list:
                final_area_list.append(new_area)
        
        # Debug print to verify merge
        print(f"   ℹ️  Merge Logic: Existing {existing_ids} + New {dojo_target_areas} = Final {final_area_list}")        

        # --- STEP 6: GLOBAL SYNC ---
        payload = {
            "emp_code": bio_user.employeeid, 
            "first_name": bio_user.first_name, 
            "last_name": bio_user.last_name,
            "department": dept_id, 
            "position": pos_id, 
            "area": final_area_list, # <--- SENDING THE MERGED LIST
            "mobile": mobile,
            "gender": gender,
            # "hire_date": hire,
            "app_status": 1
        }

        print(f"--> [EasyTime] Syncing {bio_user.employeeid} Areas: {final_area_list}")
        self.create_employee_raw(payload)

        # --- STEP 7: FORCE BIO-DATA PUSH ---
        # Use 'sync_data_to_device' to force biometrics transfer
        sync_payload = {
            "devices": [term_id],
            "employees": True,
            "finger_print": True, 
            "face": True, 
            "vl_face": True 
        }
        
        sync_url = f"{self.base_url}/iclock/api/terminals/sync_data_to_device/"

        try:
            res = requests.post(sync_url, json=sync_payload, headers=self.get_headers())
            return self._handle_response(res)
        except Exception as e:
            return {"status": "error", "message": str(e)}


        
    # --- UTILS ---

    def create_employee_raw(self, employee_data):
        headers = self.get_headers()
        emp_code = employee_data.get('emp_code')
        
        # --- FIX: CHECK EXISTENCE FIRST ---
        # Don't try to create blind. Check if user exists to get their UUID.
        internal_id = self.get_employee_internal_id(emp_code)

        if internal_id:
            # ---------------------------
            # SCENARIO A: USER EXISTS -> UPDATE (PUT)
            # ---------------------------
            print(f"   ℹ️  User {emp_code} found (UUID: {internal_id}). Updating...")
            
            update_url = f"{self.employee_url}{internal_id}/"
            
            try:
                # We use PUT to update the specific UUID
                update_res = requests.put(update_url, json=employee_data, headers=headers)
                
                if update_res.status_code in [200, 201]:
                    print(f"   ✅ Update Success for {emp_code}")
                    return update_res.json()
                else:
                    print(f"   ❌ Update Failed: {update_res.status_code} {update_res.text}")
                    return {"status": "error", "message": update_res.text}
            except Exception as e:
                print(f"   ❌ Update Exception: {e}")
                return {}

        else:
            # ---------------------------
            # SCENARIO B: USER NEW -> CREATE (POST)
            # ---------------------------
            print(f"   🆕 User {emp_code} not found. Creating new...")
            
            try:
                res = requests.post(self.employee_url, json=employee_data, headers=headers)
                
                if res.status_code == 201:
                    print(f"   ✅ Create Success for {emp_code}")
                    return res.json()
                else:
                    print(f"   ❌ Create Failed: {res.status_code} {res.text}")
                    # Special Case: If it failed because it exists (race condition), try logic A again? 
                    # Usually not needed if the check above works.
                    return {"status": "error", "message": res.text}
            except Exception as e:
                print(f"   ❌ Create Exception: {e}")
                return {}

                
    # def create_employee_raw(self, employee_data):
    #     headers = self.get_headers()
    #     emp_code = employee_data.get('emp_code')
        
    #     try:
    #         # 1. Try Create (POST)
    #         # print(f"   [API Request] Creating User {emp_code} with Areas: {employee_data.get('area')}")
    #         print(f"   [API Request] Creating/Updating User {emp_code}...")
    #         res = requests.post(self.employee_url, json=employee_data, headers=headers)
            
    #         if res.status_code == 201: 
    #             return res.json()
            
    #         # 2. If Exists (400), Try Update (PUT)
    #         if res.status_code == 400:
    #             print(f"   [...] User {emp_code} exists. Fetching ID for Update...")
                
    #             # A. Get Internal ID
    #             internal_id = self.get_employee_internal_id(emp_code)
                
    #             if not internal_id:
    #                 print(f"   ❌ Update Failed: Could not find Internal ID for {emp_code}")
    #                 return {"status": "error", "message": "User exists but ID not found"}

    #             # B. Send Update using Internal ID
    #             update_url = f"{self.employee_url}{internal_id}/"
    #             print(f"   [...] Sending PUT to {update_url}")
                
    #             update_res = requests.put(update_url, json=employee_data, headers=headers)

    #             if update_res.status_code in [200, 201]:
    #                 print(f"   ✅ Update Success: Areas {employee_data.get('area')}")
    #                 return update_res.json()
    #             else:
    #                 print(f"   ❌ Update Failed: {update_res.status_code} {update_res.text}")
    #                 return {"status": "error", "message": update_res.text}

    #     except Exception as e:
    #         print(f"   ❌ API Error: {e}")
        
    #     return {}

    def delete_employee(self, emp_code):
        headers = self.get_headers()
        uid = self.get_employee_internal_id(emp_code)
        if not uid: return {"status": "error", "message": "User not found"}
        try:
            res = requests.delete(f"{self.employee_url}{uid}/", headers=headers)
            return {"status": "success"} if res.status_code in [200, 204] else {"status": "error"}
        except Exception as e: return {"status": "error", "message": str(e)}

    # ... (Keep get_employee_bio_status, get_all_employees, and Remote Actions the same) ...
    # (I assume you have those from the previous complete paste)
    
    # Re-pasting the essential tail end for completeness
    def get_employee_bio_status(self, emp_code):
        headers = self.get_headers()
        try:
            res = requests.get(f"{self.employee_url}?emp_code={emp_code}", headers=headers)
            if res.status_code == 200:
                data = res.json().get('data', [])
                if data:
                    u = data[0]
                    fp = u.get('fingerprint', '-') != '-'
                    face = (u.get('face', '-') != '-') or (u.get('vl_face', '-') != '-')
                    return {"status": "success", "has_fingerprint": fp, "has_face": face}
            return {"status": "error", "message": "User not found"}
        except Exception as e: return {"status": "error", "message": str(e)}

    def get_all_employees(self):
        headers = self.get_headers()
        employees = []
        page = 1
        while True:
            try:
                res = requests.get(f"{self.employee_url}?page={page}&page_size=100", headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get('data', [])
                    if not results: break
                    employees.extend(results)
                    if not data.get('next'): break
                    page += 1
                else: break
            except: break
        return employees

    def unlock_terminal(self, sn):
        return self._post_action(self.unlock_url, {"sn": sn})

    def reboot_terminal(self, sn):
        tid = self.get_terminal_id_by_sn(sn)
        return self._post_action(self.terminal_action_url, {"object_ids": [tid], "action_type": "reboot"}) if tid else {"status": "error"}

    def enroll_remotely(self, sn, emp_code, bio_type, finger=None):
        tid = self.get_terminal_id_by_sn(sn)
        uid = self.get_employee_internal_id(emp_code)
        if not tid or not uid: return {"status": "error", "message": "Device or User not found"}
        payload = {"devices": [tid], "bio_type": int(bio_type), "employee": str(uid)}
        if finger is not None: payload["finger"] = int(finger)
        return self._post_action(self.enroll_url, payload)

    def get_attendance_logs(self, from_dt, to_dt, sn=None):
        headers = self.get_headers()
        params = {"start_time": from_dt, "end_time": to_dt, "page_size": 1000}
        if sn: params['terminal_sn'] = sn
        try:
            res = requests.get(f"{self.base_url}/iclock/api/transactions/", params=params, headers=headers)
            return res.json().get('data', []) if res.status_code == 200 else []
        except: return []

    def _post_action(self, url, data):
        try:
            res = requests.post(url, json=data, headers=self.get_headers())
            return self._handle_response(res)
        except Exception as e: return {"status": "error", "message": str(e)}

    def _handle_response(self, res):
        if res.status_code in [200, 201]: return {"status": "success", "data": res.json()}
        return {"status": "error", "code": res.status_code, "message": res.text}
    
        
    # --- NEW HELPER: Identify Dojo Areas ---
    def get_dojo_managed_area_ids(self):
        """
        Returns a list of Area IDs that are linked to Dojo Devices (Machines/Enrollment).
        We use this to selectively remove ONLY Dojo access, preserving manual server areas.
        """
        from django.apps import apps
        from django.db.models import Q
        BiometricDevice = apps.get_model('app1', 'BiometricDevice')
        
        # 1. Find SNs of all devices managed by Dojo Logic
        # (Machines + Enrollment Devices. Exclude pure Attendance/Gate devices)
        target_sns = set(BiometricDevice.objects.filter(
            Q(is_attendance_device=False) | Q(is_enrollment_device=True)
        ).values_list('serial_number', flat=True))
        
        dojo_area_ids = set()

        # 2. Fetch Terminal Details from API to get their Area IDs
        headers = self.get_headers()
        try:
            # Fetch all terminals (page size 1000 to be safe)
            res = requests.get(f"{self.terminals_list_url}?page_size=1000", headers=headers)
            if res.status_code == 200:
                data = res.json().get('data', [])
                for term in data:
                    if term.get('sn') in target_sns:
                        # Extract Area ID safely
                        area_val = term.get('area')
                        if isinstance(area_val, dict):
                            dojo_area_ids.add(area_val.get('id'))
                        elif isinstance(area_val, int):
                            dojo_area_ids.add(area_val)
        except Exception as e:
            print(f"   ⚠️  Error fetching Dojo Area IDs: {e}")
            
        return list(dojo_area_ids)

    def remove_dojo_access(self, emp_code):
        """
        SAFE REVOKE: Removes ONLY Dojo-related areas. 
        Keeps manual server areas (e.g. Canteen, Server Room).
        """
        internal_id = self.get_employee_internal_id(emp_code)
        if not internal_id: return {"status": "error", "message": "User not found on server"}

        headers = self.get_headers()
        
        # 1. Fetch Current Data
        try:
            user_data = requests.get(f"{self.employee_url}{internal_id}/", headers=headers).json()
            current_areas = user_data.get('area', [])
        except:
            return {"status": "error", "message": "Failed to fetch user data"}

        # 2. Identify Dojo Areas to Remove
        dojo_ids_to_remove = self.get_dojo_managed_area_ids()
        
        # Also always clean up the hardcoded defaults just in case
        # (Optional: Add 13 or whatever your Dojo Room ID is if dynamic fail)
        if 13 not in dojo_ids_to_remove: dojo_ids_to_remove.append(13)

        print(f"   ℹ️  Dojo Managed Areas to Strip: {dojo_ids_to_remove}")

        # 3. Filter: Keep ID if it is NOT in the Dojo List
        new_area_list = []
        old_ids_for_log = [] # Just for printing

        for item in current_areas:
            # Extract ID
            a_id = item.get('id') if isinstance(item, dict) else item
            old_ids_for_log.append(a_id)
            
            # THE LOGIC: Keep it if it's NOT a Dojo Area
            # (We also always keep Area 1 and 2 as safety defaults)
            if (a_id not in dojo_ids_to_remove) or (a_id in [1, 2]):
                new_area_list.append(a_id)
        
        # Safety: Ensure they have at least Default Area 1
        if not new_area_list: new_area_list = [1]

        print(f"   ℹ️  Revoking Access for {emp_code}. Old: {old_ids_for_log} -> New: {new_area_list}")

        # 4. Prepare Payload
        dept_val = user_data.get('department')
        dept_id = dept_val.get('id') if isinstance(dept_val, dict) else dept_val

        pos_val = user_data.get('position')
        pos_id = pos_val.get('id') if isinstance(pos_val, dict) else pos_val

        payload = {
            "area": new_area_list,
            "emp_code": user_data.get('emp_code'),
            "first_name": user_data.get('first_name'),
            "last_name": user_data.get('last_name'),
            "department": dept_id,
            "position": pos_id,
            "mobile": user_data.get('mobile'),
            "gender": user_data.get('gender'),
            "hire_date": user_data.get('hire_date'),
            "app_status": 1
        }
        
        try:
            res = requests.put(f"{self.employee_url}{internal_id}/", json=payload, headers=headers)
            if res.status_code in [200, 201]:
                return {"status": "success", "message": "Machine Access Revoked (Manual Access Kept)"}
            else:
                return {"status": "error", "message": res.text}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        

#Numax easytimepro end-----------------------
