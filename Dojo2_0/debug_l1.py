import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Dojo2_0.settings')
django.setup()

from app1.models import MasterTable, Department

def debug_l1():
    print("--- Debugging Level 1 Visibility ---")
    
    # 1. Count Total Employees
    total = MasterTable.objects.count()
    print(f"Total Employees in MasterTable: {total}")
    
    # 2. List Departments
    depts = Department.objects.values('department_id', 'department_name')
    print("--- Departments ---")
    for d in depts:
        print(f"ID: {d['department_id']} | Name: {d['department_name']}")
        
    # 3. Check Employees per Department
    print("\n--- Employee Counts per Department ---")
    for d in depts:
        did = d['department_id']
        count = MasterTable.objects.filter(department_id=did).count()
        print(f"Dept {did} ({d['department_name']}): {count} employees")
        
    # 4. Employees with NO Department
    no_dept = MasterTable.objects.filter(department__isnull=True).count()
    print(f"Employees with NULL Department: {no_dept}")
    
    # 5. Simulate "Department ID" passed from Frontend
    # User's URL likely has a department_id. 
    # If the user selects a department in frontend, say ID 100.
    # If I filter `department_id=100` and count is 0, that's the issue.
    
    # Let's list IDs of departments that actually have employees
    valid_depts = MasterTable.objects.values_list('department_id', flat=True).distinct()
    print(f"\nDepartment IDs present in MasterTable: {list(valid_depts)}")

if __name__ == "__main__":
    debug_l1()
