from django.test import TestCase

# Create your tests here.


#================== BiometricAttendance ==================#

import os
import pandas as pd
from celery import shared_task
from tablib import Dataset
from .resources import BiometricAttendanceResource
# from .models import ManagementReview, AdvancedManpowerCTQ, Factory, Department, HQ

@shared_task
def import_attendance_from_excel():
    EXCEL_FILE_PATH = r"D:\Datashare\attendance.xlsx"

    if not os.path.exists(EXCEL_FILE_PATH):
        return {'status': 'failed', 'reason': 'Excel file not found'}

    dataset = Dataset()
    try:
        with open(EXCEL_FILE_PATH, 'rb') as f:
            dataset.load(f.read(), format='xlsx')
    except Exception as e:
        return {'status': 'failed', 'reason': str(e)}

    resource = BiometricAttendanceResource()
    result = resource.import_data(dataset, dry_run=True)
    if result.has_errors():
        return {'status': 'failed', 'errors': str(result.row_errors())}

    resource.import_data(dataset, dry_run=False)
    return {'status': 'success', 'message': 'Attendance imported successfully'}


#================== BiometricAttendance End ==================#
