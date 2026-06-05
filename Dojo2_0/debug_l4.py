import os
import django
import sys

# Add current directory to sys.path just in case
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Dojo2_0.settings')
django.setup()

from app1.models import MasterTable, Score, Station, Level

def debug_eligibility():
    print("--- Debugging Level 4 Eligibility ---")

    # 1. Identify IDs
    try:
        all_levels = list(Level.objects.values('level_id', 'level_name'))
        print("--- All Levels in DB ---")
        for l in all_levels:
            print(f"ID: {l['level_id']} | Name: {l['level_name']}")
            
        l3_objs = Level.objects.filter(level_name__icontains="Level-3")
        l4_objs = Level.objects.filter(level_name__icontains="Level-4")
        
        # We confirmed IDs are 3 and 4 via print above, so safe to get by ID if names match or just use ID
        l3 = Level.objects.get(pk=3)
        l4 = Level.objects.get(pk=4)

    except Exception as e:
        print(f"Error finding levels: {e}")
        return

    try:
        stations = Station.objects.filter(station_name__icontains="Inspection")
        print(f"--- Stations matching 'Inspection' ---")
        for s in stations:
            print(f"ID: {s.station_id} | Name: {s.station_name}")
            
        # Find any station with Level 3 passed scores
        print("\n--- Stations with Level 3 Passed Scores ---")
        distinct_skills = Score.objects.filter(level=l3, passed=True).values_list('skill_id', flat=True).distinct()
        for sid in distinct_skills:
            try:
                st = Station.objects.get(pk=sid)
                print(f"Station ID: {sid} | Name: {st.station_name} has Level 3 passed records.")
            except Station.DoesNotExist:
                print(f"Station ID: {sid} (Not found in Station table) has Level 3 passed records.")
                
        station = stations.first() # Default to first for now, but logical check above is more important
        if not station:
            print("No station found.")
            return
    except Exception as e:
        print(f"Error finding station: {e}")
        return


    # 2. Find employees who PASSED Level 3 for this station
    # Note: Using 'skill' field for station based on views.py analysis
    passed_l3 = Score.objects.filter(
        level=l3, 
        skill=station, 
        passed=True
    ).values_list('employee_id', flat=True)
    
    passed_l3_ids = list(passed_l3)
    print(f"Employees who PASSED Level 3 for {station.station_name}: {len(passed_l3_ids)}")
    print(f"Sample IDs: {passed_l3_ids[:5]}")

    # HARDCODE Station 97 (Inspection) as per screenshot
    try:
        st97 = Station.objects.get(pk=97)
        print(f"\n--- Checking Specific Station: {st97.station_name} (ID: 97) ---")
        
        all_scores_97 = Score.objects.filter(skill=st97)
        count = all_scores_97.count()
        print(f"Total Scores for Station 97: {count}")
        
        if count > 0:
            print("Sample Scores (Level | Passed | Attempt):")
            for s in all_scores_97[:10]:
                print(f"- Level: {s.level.level_name} (ID: {s.level.level_id}) | Passed: {s.passed} | Attempt: {s.attempt_no}")
        else:
            print("No scores found for Station 97 at all.")
            
        passed_l2_97 = Score.objects.filter(level__level_id=2, skill=st97, passed=True).count()
        passed_l3_97 = Score.objects.filter(level__level_id=3, skill=st97, passed=True).count()

        if passed_l3_97 == 0:
            print("CONCLUSION: No one passed Level 3 for Station 97 => No one eligible for Level 4.")
            if passed_l2_97 > 0:
                print(f"However, {passed_l2_97} employees passed Level 2. They are eligible for Level 3, NOT Level 4.")
    
    except Station.DoesNotExist:
        print("Station 97 not found.")


    
    passed_l4 = Score.objects.filter(
        level=l4,
        skill=station,
        passed=True,
        employee_id__in=passed_l3_ids
    ).values_list('employee_id', flat=True)
    
    passed_l4_ids = list(passed_l4)
    print(f"Employees who ALREADY PASSED Level 4 for {station.station_name}: {len(passed_l4_ids)}")
    
    # 4. Candidates who should see Level 4
    eligible = set(passed_l3_ids) - set(passed_l4_ids)
    print(f"Eligible Candidates for Level 4: {len(eligible)}")
    print(f"Sample Eligible IDs: {list(eligible)[:5]}")

    # 5. Verify Logic Simulation
    print("\n--- Simulating Logic for first eligible candidate ---")
    if eligible:
        test_emp_id = list(eligible)[0]
        print(f"Testing for Emp ID: {test_emp_id}")
        
        emp_passed_map = {}
        # Fetch ALL passed scores for this emp
        scores = Score.objects.filter(employee_id=test_emp_id, passed=True).values('level_id', 'skill_id')
        for s in scores:
            lid = s['level_id']
            sid = s['skill_id']
            if test_emp_id not in emp_passed_map: emp_passed_map[test_emp_id] = {} # Fix structure match
            if lid not in emp_passed_map[test_emp_id]: emp_passed_map[test_emp_id][lid] = set()
            emp_passed_map[test_emp_id][lid].add(sid)
            
        print(f"Passed Map for {test_emp_id}: {emp_passed_map.get(test_emp_id)}")
        
        target_level = l4.level_id
        target_station = station.station_id
        
        passed_levels = emp_passed_map.get(test_emp_id, {})
        
        has_l3 = target_station in passed_levels.get(l3.level_id, set())
        print(f"Has Passed Level 3 ({l3.level_id}) for Station ({target_station})? : {has_l3}")

        has_l4 = target_station in passed_levels.get(l4.level_id, set())
        print(f"Has Passed Level 4 ({l4.level_id}) for Station ({target_station})? : {has_l4}")
        
        if has_l3 and not has_l4:
            print("RESULT: Eligible! (Should be visible)")
        else:
            print("RESULT: Not Valid according to logic.")
    else:
        print("No eligible candidates to test logic against.")

if __name__ == "__main__":
    debug_eligibility()
