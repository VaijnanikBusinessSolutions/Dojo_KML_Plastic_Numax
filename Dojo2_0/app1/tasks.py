


import os
import re
import datetime
import shutil
import time
from celery import shared_task
from tablib import Dataset
from .models import BiometricAttendance, SystemSettings


@shared_task
def import_attendance_from_excel():
    """
    Celery task to automatically import attendance from Excel files.
    Reads the source path from SystemSettings database.
    """
    
    # 1. GET PATH FROM DATABASE
    settings = SystemSettings.objects.first()
    
    if not settings or not settings.excel_source_path:
        return {
            'status': 'failed', 
            'reason': 'Source path not configured. Please set it in Settings.'
        }
    
    BASE_DIR = settings.excel_source_path
    PROCESSED_DIR = os.path.join(BASE_DIR, "Processed")

    # 2. CHECK BASE DIRECTORY
    if not os.path.exists(BASE_DIR):
        return {
            'status': 'failed', 
            'reason': f'Source directory not found: {BASE_DIR}'
        }
    
    # 3. CREATE PROCESSED DIRECTORY IF NOT EXISTS
    if not os.path.exists(PROCESSED_DIR):
        try:
            os.makedirs(PROCESSED_DIR)
        except Exception as e:
            return {
                'status': 'failed', 
                'reason': f"Could not create Processed folder: {e}"
            }

    # 4. GET EXCEL FILES
    try:
        all_files = os.listdir(BASE_DIR)
    except Exception as e:
        return {
            'status': 'failed',
            'reason': f'Could not read directory: {e}'
        }
    
    excel_files = [f for f in all_files if f.endswith('.xlsx') or f.endswith('.xls')]
    
    if not excel_files:
        return {
            'status': 'skipped', 
            'message': 'No Excel files found to process.',
            'source_path': BASE_DIR
        }

    results_log = []

    # 5. PROCESS EACH FILE
    for filename in excel_files:
        file_path = os.path.join(BASE_DIR, filename)
        
        # A. EXTRACT DATE FROM FILENAME
        # Supports formats: 04.12.25, 4.12.2025, 04-12-25, etc.
        match = re.search(r'(\d{1,2})[.\-_](\d{1,2})[.\-_](\d{2,4})', filename)
        
        if not match:
            msg = f"Skipped {filename}: No date pattern found in filename"
            results_log.append(msg)
            continue 

        day, month, year = match.groups()
        if len(year) == 2: 
            year = "20" + year
        date_str = f"{year}-{month.zfill(2)}-{day.zfill(2)}"

        # B. READ EXCEL FILE
        dataset = Dataset()
        file_format = 'xls' if filename.endswith('.xls') else 'xlsx'
        
        try:
            with open(file_path, 'rb') as f:
                imported_data = dataset.load(f.read(), format=file_format)
        except Exception as e:
            results_log.append(f"Error reading {filename}: {e}")
            continue

        # Clean headers
        if imported_data.headers:
            imported_data.headers = [str(h).strip() for h in imported_data.headers]

        # C. HELPER FUNCTIONS
        def parse_time(val):
            if not val or str(val).lower() == 'nan': 
                return None
            if isinstance(val, datetime.time): 
                return val
            if isinstance(val, datetime.datetime): 
                return val.time()
            try: 
                return datetime.datetime.strptime(str(val).strip(), '%H:%M:%S').time()
            except: 
                try:
                    return datetime.datetime.strptime(str(val).strip(), '%H:%M').time()
                except:
                    return None

        def clean_val(val):
            return str(val).strip() if val and str(val).lower() != 'nan' else None

        # D. SAVE TO DATABASE
        saved_count = 0
        for row in imported_data.dict:
            try:
                card_no = row.get('Card No')
                if not card_no: 
                    continue
                    
                BiometricAttendance.objects.update_or_create(
                    card_no=str(card_no).strip(),
                    attendance_date=date_str,
                    defaults={
                        'sr_no': row.get('Sr.No.'),
                        'pay_code': row.get('PayCode'),
                        'employee_name': row.get('Employee Name'),
                        'department': row.get('Department'),
                        'designation': row.get('Designation'),
                        'shift': row.get('Shift'),
                        'start': parse_time(row.get('Start')),
                        'in_time': parse_time(row.get('In')),
                        'out_time': parse_time(row.get('Out')),
                        'hrs_works': clean_val(row.get('Hrs Works')),
                        'status': row.get('Status'),
                        'late_arrival': clean_val(row.get('Late Arriv.')),
                        'early_arrival': clean_val(row.get('Early Arriv.')),
                        'shift_early': clean_val(row.get('Shift Early')),
                        'excess_lunch': clean_val(row.get('Excess Lunch')),
                        'ot': clean_val(row.get('Ot')),
                        'ot_amount': clean_val(row.get('Ot Amount')),
                        'os': clean_val(row.get('Os')),
                        'manual': row.get('Manual'),
                    }
                )
                saved_count += 1
            except Exception as e:
                pass

        # E. MOVE FILE TO PROCESSED
        try:
            destination = os.path.join(PROCESSED_DIR, filename)
            
            # Handle duplicate filenames
            if os.path.exists(destination):
                timestamp = datetime.datetime.now().strftime("%H%M%S")
                name, ext = os.path.splitext(filename)
                destination = os.path.join(PROCESSED_DIR, f"{name}_{timestamp}{ext}")

            time.sleep(0.5)  # Brief pause to ensure file handle is released
            shutil.move(file_path, destination)
            
            msg = f"SUCCESS: {filename} → {saved_count} records imported, moved to Processed"
            results_log.append(msg)
            
        except PermissionError:
            msg = f"IMPORTED but MOVE FAILED ({filename}): File may be open in Excel"
            results_log.append(msg)
        except Exception as e:
            msg = f"IMPORTED but MOVE FAILED ({filename}): {str(e)}"
            results_log.append(msg)

    return {
        'status': 'completed',
        'files_processed': len(results_log),
        'source_path': BASE_DIR,
        'log': results_log
    }








# --------------------------Numax easytimepro start -----------------------------------

from celery import shared_task
from django.utils import timezone
from datetime import datetime
from django.conf import settings
from .models import BioUser, BiometricDevice, LocalAttendanceLog, OperatorDailyLog
from .services.easytime_client import EasyTimeClient

@shared_task
def auto_sync_easytime_logs():
    """
    Fetches today's logs from EasyTimePro API every 10 minutes.
    Updates:
      1. LocalAttendanceLog (All raw punches)
      2. OperatorDailyLog (Machine Start/End times)
    """
    print(f"⏳ [Celery] Starting Auto-Sync at {datetime.now()}...")
    
    # 1. Setup Dates (Today)
    now = timezone.now()
    date_str = now.strftime("%Y-%m-%d")
    from_dt = f"{date_str} 00:00:00"
    to_dt = f"{date_str} 23:59:59"

    # 2. Fetch from API
    client = EasyTimeClient()
    # We fetch ALL logs for today (API handles the heavy lifting)
    raw_logs = client.get_attendance_logs(from_dt, to_dt)

    if not raw_logs:
        print("[Celery] No logs found for today.")
        return "No Logs"

    # 3. Optimization: Create Lookups (Avoid DB hits in loop)
    # Map: 'EMP001' -> User Object
    local_users = {user.employeeid: user for user in BioUser.objects.all()}
    # Map: 'SN123' -> Device Object
    local_devices = {d.serial_number: d for d in BiometricDevice.objects.all()}

    saved_count = 0
    updated_history_count = 0

    # 4. Process Logs
    for log in raw_logs:
        emp_code = log.get('emp_code')
        punch_time_str = log.get('punch_time')
        terminal_sn = log.get('terminal_sn')

        # Convert String to Timezone-Aware Datetime
        try:
            dt_obj = datetime.strptime(punch_time_str, "%Y-%m-%d %H:%M:%S")
            aware_dt = timezone.make_aware(dt_obj)
        except (ValueError, TypeError):
            continue

        user_obj = local_users.get(emp_code)
        
        if not user_obj:
            continue # Skip unknown users

        # --- A. SAVE RAW LOG ---
        try:
            _, created = LocalAttendanceLog.objects.get_or_create(
                bio_user=user_obj,
                punch_time=aware_dt,
                device_sn=terminal_sn,
                defaults={'area_alias': log.get('area_alias')}
            )
            if created: saved_count += 1
        except Exception: 
            pass

        # --- B. UPDATE OPERATOR HISTORY (New Logic) ---
        if terminal_sn in local_devices:
            device_obj = local_devices[terminal_sn]

            # Rule: Only Machines (No Attendance/Enrollment devices)
            if not device_obj.is_attendance_device and not device_obj.is_enrollment_device:
                
                # Get/Create Summary Record
                summary, _ = OperatorDailyLog.objects.get_or_create(
                    bio_user=user_obj,
                    device=device_obj,
                    date=dt_obj.date(),
                    defaults={
                        'first_punch': aware_dt,
                        'last_punch': aware_dt,
                        'employee_name_snapshot': user_obj.first_name,
                        'device_name_snapshot': device_obj.name
                    }
                )

                # Update Time Window
                changed = False
                if aware_dt < summary.first_punch:
                    summary.first_punch = aware_dt
                    changed = True
                
                if aware_dt > summary.last_punch:
                    summary.last_punch = aware_dt
                    changed = True
                
                if changed: 
                    summary.save()
                    updated_history_count += 1

    result_msg = f"✅ Auto-Sync Done. New Logs: {saved_count}, History Updates: {updated_history_count}"
    print(f"[Celery] {result_msg}")
    return result_msg


# -----------Numax easytimepro End ---------------------------
