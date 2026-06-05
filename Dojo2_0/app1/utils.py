from django.core.mail import send_mail
from django.conf import settings

def send_milestone_email(subject, message, recipient_list):
    """
    Sends a plain text email to multiple recipients.
    """
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=False,
    )














# # utils.py

# from .models import LevelTwoTraineeInfo, Score, OperatorSkill,EmployeeMaster
# from django.db import transaction

# def check_and_update_operator_skill(trainee_id):
#     try:
#         # Get the trainee info
#         trainee = LevelTwoTraineeInfo.objects.get(traineeId=trainee_id)

#         # 🛠 Match based on pay_code instead of emp_id
#         employee = EmployeeMaster.objects.get(pay_code=trainee_id)

#         # Calculate and update training status
#         training_status = trainee.calculate_and_save_training_status()

#         # Check for the latest score
#         latest_score = Score.objects.filter(employee=employee).order_by('-created_at').first()

#         if training_status == "Pass" and latest_score and latest_score.passed:
#             station = latest_score.skill
#             level = latest_score.level

#             if not station or not level:
#                 print("Station or level not provided in score.")
#                 return False

#             with transaction.atomic():
#                 skill_obj, created = OperatorSkill.objects.update_or_create(
#                     operator=employee,
#                     station=station,
#                     defaults={'skill_level': level}
#                 )
#                 print(f"OperatorSkill {'created' if created else 'updated'} for {employee.name}")
#                 return True

#         else:
#             print("Training or test not passed.")
#             return False

#     except LevelTwoTraineeInfo.DoesNotExist:
#         print(f"Trainee with ID {trainee_id} does not exist.")
#         return False

#     except EmployeeMaster.DoesNotExist:
#         print(f"Employee with pay_code {trainee_id} does not exist.")
#         return False

#     except Exception as e:
#         print(f"Error: {str(e)}")
#         return False







# from .models import LevelThreeTraineeInfo, Score, OperatorSkill, EmployeeMaster
# from django.db import transaction

# def check_and_update_operator_skill_level_three(trainee_id):
#     try:
#         # Get trainee
#         trainee = LevelThreeTraineeInfo.objects.get(trainee_Id=trainee_id)

#         # Get employee based on pay_code = trainee_id
#         employee = EmployeeMaster.objects.get(pay_code=trainee_id)

#         # Recalculate training status
#         training_status = trainee.calculate_and_save_training_status()

#         # Get latest test score for this employee
#         latest_score = Score.objects.filter(employee=employee).order_by('-created_at').first()

#         if training_status == "Pass" and latest_score and latest_score.passed:
#             station = latest_score.skill
#             level = latest_score.level

#             if not station or not level:
#                 print("Missing station or level in latest score.")
#                 return False

#             with transaction.atomic():
                
#                 skill_obj, created = OperatorSkill.objects.update_or_create(
#                     operator=employee,
#                     station=station,
#                     defaults={'skill_level': level}
#                 )
#                 print(f"OperatorSkill {'created' if created else 'updated'} for {employee.name}")
#                 return True

#         else:
#             print("Either training or test not passed.")
#             return False

#     except LevelThreeTraineeInfo.DoesNotExist:
#         print(f"No Level 3 trainee found for ID {trainee_id}")
#         return False

#     except EmployeeMaster.DoesNotExist:
#         print(f"No Employee found with pay_code {trainee_id}")
#         return False

#     except Exception as e:
#         print(f"Error during Level 3 skill update: {str(e)}")
#         return False

# utils.py




from django.core.mail import send_mail
from django.conf import settings
from .models import (
    OperatorPerformanceEvaluation, OJTLevel2Quantity, 
    MasterTable, Score, Station, StationSetting, 
    TenCyclePassingCriteria, QuantityPassingCriteria,
    Level, Department
)
from django.db import transaction
from django.db.models import Max

def send_milestone_email(subject, message, recipient_list):
    """
    Sends a plain text email to multiple recipients.
    """
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=False,
    )





def check_and_update_operator_skill_ten_cycle(emp_id):
    """
    Check 10-cycle evaluation status and update operator skill level.
    Uses OperatorPerformanceEvaluation model.
    """
    try:
        # Get the employee from MasterTable
        employee = MasterTable.objects.get(emp_id=emp_id)
        
        # Get the latest 10-cycle evaluation for this employee
        latest_evaluation = OperatorPerformanceEvaluation.objects.filter(
            employee=employee
        ).order_by('-created_at').first()

        if not latest_evaluation:
            print(f"No 10-cycle evaluation found for employee {emp_id}")
            return False

        # Check if evaluation is completed and passed
        if latest_evaluation.is_completed and latest_evaluation.final_status == 'Pass':
            station = latest_evaluation.station
            level = latest_evaluation.level

            if not station or not level:
                print("Station or level not provided in evaluation.")
                return False

            # Get latest score for this employee and station
            latest_score = Score.objects.filter(
                employee=employee,
                skill=station
            ).order_by('-created_at').first()

            # Check if test was also passed
            if latest_score and latest_score.passed:
                with transaction.atomic():
                    # Create or update skill level
                    # Note: You'll need to create an OperatorSkill model if it doesn't exist
                    # For now, we'll assume you want to track this in the Score model
                    skill_obj, created = Score.objects.update_or_create(
                        employee=employee,
                        skill=station,
                        level=level,
                        defaults={
                            'marks': latest_score.marks,
                            'percentage': latest_score.percentage,
                            'passed': True
                        }
                    )
                    print(f"Skill level {'created' if created else 'updated'} for {employee} - {station} - {level}")
                    return True
            else:
                print("Test not passed or no score found.")
                return False
        else:
            print("10-cycle evaluation not completed or not passed.")
            return False

    except MasterTable.DoesNotExist:
        print(f"Employee with emp_id {emp_id} does not exist.")
        return False
    except Exception as e:
        print(f"Error in ten-cycle skill update: {str(e)}")
        return False





def check_and_update_operator_skill_ojt_quantity(trainee_id):
    """
    Check OJT Quantity evaluation status and update operator skill level.
    Uses OJTLevel2Quantity model.
    """
    try:
        # Get the OJT record
        ojt_record = OJTLevel2Quantity.objects.get(trainee_id=trainee_id)
        
        # Get the employee from MasterTable using emp_id
        if ojt_record.emp_id:
            employee = MasterTable.objects.get(emp_id=ojt_record.emp_id)
        else:
            print(f"No emp_id found for trainee {trainee_id}")
            return False

        # Evaluate the OJT status
        ojt_record.evaluate_status()

        # Check if OJT is passed
        if ojt_record.status == "Pass":
            # Get station from station_name (you might need to map this)
            station = Station.objects.filter(station_name=ojt_record.station_name).first()
            level = ojt_record.level

            if not station or not level:
                print("Station or level not provided in OJT record.")
                return False

            # Get latest score for this employee and station
            latest_score = Score.objects.filter(
                employee=employee,
                skill=station
            ).order_by('-created_at').first()

            # Check if test was also passed
            if latest_score and latest_score.passed:
                with transaction.atomic():
                    # Create or update skill level
                    skill_obj, created = Score.objects.update_or_create(
                        employee=employee,
                        skill=station,
                        level=level,
                        defaults={
                            'marks': latest_score.marks,
                            'percentage': latest_score.percentage,
                            'passed': True
                        }
                    )
                    print(f"OJT Quantity skill level {'created' if created else 'updated'} for {employee} - {station} - {level}")
                    return True
            else:
                print("Test not passed or no score found.")
                return False
        else:
            print("OJT Quantity evaluation not passed.")
            return False

    except OJTLevel2Quantity.DoesNotExist:
        print(f"OJT record with trainee_id {trainee_id} does not exist.")
        return False
    except MasterTable.DoesNotExist:
        print(f"Employee with emp_id {ojt_record.emp_id} does not exist.")
        return False
    except Exception as e:
        print(f"Error in OJT quantity skill update: {str(e)}")
        return False

def check_and_update_operator_skill_general(emp_id, evaluation_type='ten_cycle'):
    """
    Generic function to check and update operator skill based on evaluation type.
    """
    if evaluation_type == 'ten_cycle':
        return check_and_update_operator_skill_ten_cycle(emp_id)
    elif evaluation_type == 'ojt_quantity':
        return check_and_update_operator_skill_ojt_quantity(emp_id)
    else:
        print(f"Unsupported evaluation type: {evaluation_type}")
        return False

def create_skill_level_record(employee, station, level, marks, percentage, passed=True):
    """
    Helper function to create or update skill level record.
    """
    try:
        with transaction.atomic():
            skill_obj, created = Score.objects.update_or_create(
                employee=employee,
                skill=station,
                level=level,
                defaults={
                    'marks': marks,
                    'percentage': percentage,
                    'passed': passed
                }
            )
            print(f"Skill record {'created' if created else 'updated'} for {employee} - {station} - {level}")
            return True
    except Exception as e:
        print(f"Error creating skill record: {str(e)}")
        return False

# Additional utility functions for skill management

def get_operator_current_skill_level(employee, station):
    """
    Get the current skill level for an operator at a specific station.
    """
    try:
        latest_score = Score.objects.filter(
            employee=employee,
            skill=station,
            passed=True
        ).select_related('level').order_by('-created_at').first()
        
        if latest_score:
            return {
                'level': latest_score.level,
                'percentage': latest_score.percentage,
                'marks': latest_score.marks,
                'date': latest_score.created_at
            }
        return None
    except Exception as e:
        print(f"Error getting current skill level: {str(e)}")
        return None

def get_passing_criteria_for_evaluation(employee, station, level, evaluation_type):
    """
    Get passing criteria for a specific evaluation type.
    """
    try:
        department = station.subline.line.department
        
        if evaluation_type == 'ten_cycle':
            criteria = TenCyclePassingCriteria.objects.filter(
                level=level,
                department=department,
                station=station
            ).first()
            return criteria.passing_percentage if criteria else 60.0
            
        elif evaluation_type == 'ojt_quantity':
            criteria = QuantityPassingCriteria.objects.filter(
                level=level,
                department=department
            ).first()
            if criteria:
                return {
                    'production': criteria.production_passing_percentage,
                    'rejection': criteria.rejection_passing_percentage
                }
            return None
            
        return None
    except Exception as e:
        print(f"Error getting passing criteria: {str(e)}")
        return None

def send_skill_level_notification(employee, station, level, action='updated'):
    """
    Send notification when skill level is updated.
    """
    try:
        from .models import Notification, User
        
        # Get user associated with employee (you might need to adjust this logic)
        user = User.objects.filter(employeeid=employee.emp_id).first()
        
        notification = Notification.objects.create(
            title=f"Skill Level {action.capitalize()}",
            message=f"Your skill level has been {action} to {level.level_name} for station {station.station_name}",
            notification_type='milestone_reached',
            recipient=user,
            employee=employee,
            level=level,
            priority='high'
        )
        
        # Send email if user exists
        if user:
            send_milestone_email(
                subject=f"Skill Level Updated: {level.level_name}",
                message=f"Dear {employee.first_name},\n\nYour skill level has been {action} to {level.level_name} for station {station.station_name}.\n\nBest regards,\nTraining System",
                recipient_list=[user.email]
            )
        
        return True
    except Exception as e:
        print(f"Error sending skill notification: {str(e)}")
        return False
    



#Biometric helper function

# utils.py



from zeep import Client

def add_employee_to_essl_test(biouser, api_key="11", card_number="", serial_number="eaaadd12", command_id=0):
    wsdl = 'http://etime.esslsecurity.com:3366/WebAPIService.asmx?WSDL'
    client = Client(wsdl=wsdl)
    employee_code = biouser.employeeid
    employee_name = f"{biouser.first_name} {biouser.last_name}"
    try:
        result = client.service.AddEmployee(
            APIKey=api_key,
            EmployeeCode=employee_code,
            EmployeeName=employee_name,
            CardNumber=card_number,
            SerialNumber=serial_number,
            UserName='essl',
            UserPassword='essl',
            CommandId=command_id
        )
        print("Sending to eSSL:", {
            "APIKey": api_key,
            "EmployeeCode": employee_code,
            "EmployeeName": employee_name,
            "CardNumber": card_number,
            "SerialNumber": serial_number,
            "UserName": 'essl',
            "UserPassword": 'essl',
            "CommandId": command_id
        })
        print("eSSL AddEmployee result:", result)
        return result
    except Exception as e:
        print("Error syncing with eSSL:", e)
        return None


from zeep import Client
from datetime import date

def get_attendance_summary():
    # wsdl = 'http://your-essl-server/WebAPIService.asmx?WSDL'
    wsdl = 'http://etime.esslsecurity.com:3366/WebAPIService.asmx?WSDL'
    client = Client(wsdl=wsdl)
    # Example: Get today's logs
    today = date.today().strftime('%Y-%m-%d')
    result = client.service.GetTransactionsLog(
        APIKey="11",
        UserName="essl",
        UserPassword="essl",
        # APIKey="your_api_key",
        # UserName="your_api_user",
        # UserPassword="your_api_password",
        FromDate=today,
        ToDate=today,
        # ...other params as needed
    )
    # Parse result to count present/absent, etc.
    # This depends on your API's response format
    present_count = len(result)  # Example
    absent_count = 0  # You need to calculate based on your logic
    return {
        "present": present_count,
        "absent": absent_count,
        "total": present_count + absent_count
    }



# Biometric

from zeep import Client
from django.conf import settings

def add_employee_to_essl(biouser, card_number="", command_id=0):
    wsdl = settings.ESSL_API_WSDL
    api_key = settings.ESSL_API_KEY
    serial_number = settings.ESSL_SERIAL_NUMBER
    username = settings.ESSL_USERNAME
    password = settings.ESSL_PASSWORD

    client = Client(wsdl=wsdl)
    employee_code = biouser.employeeid
    employee_name = f"{biouser.first_name} {biouser.last_name}"
    try:
        result = client.service.AddEmployee(
            APIKey=api_key,
            EmployeeCode=employee_code,
            EmployeeName=employee_name,
            CardNumber=card_number,
            SerialNumber=serial_number,
            UserName=username,
            UserPassword=password,
            CommandId=command_id
        )
        print("Sending to eSSL:", {
            "APIKey": api_key,
            "EmployeeCode": employee_code,
            "EmployeeName": employee_name,
            "CardNumber": card_number,
            "SerialNumber": serial_number,
            "UserName": username,
            "UserPassword": password,
            "CommandId": command_id
        })
        print("eSSL AddEmployee result:", result)
        return result
    except Exception as e:
        print("Error syncing with eSSL:", e)
        return None
    
# ebio

# from zeep import Client
# from django.conf import settings

# def add_employee_to_essl(biouser, employee_location="Default Location", employee_role="Default Role", employee_verification_type="Fingerprint"):
#     wsdl = settings.EBIO_API_WSDL
#     username = settings.EBIO_USERNAME
#     password = settings.EBIO_PASSWORD

#     client = Client(wsdl=wsdl)
#     employee_code = biouser.employeeid
#     employee_name = f"{biouser.first_name} {biouser.last_name}"

#     try:
#         result = client.service.UpdateEmployee(
#             UserName=username,
#             Password=password,
#             EmployeeCode=employee_code,
#             EmployeeName=employee_name,
#             EmployeeLocation=employee_location,
#             EmployeeRole=employee_role,
#             EmployeeVerificationType=employee_verification_type
#         )
#         print("Sending to eBioserver:", {
#             "UserName": username,
#             "Password": password,
#             "EmployeeCode": employee_code,
#             "EmployeeName": employee_name,
#             "EmployeeLocation": employee_location,
#             "EmployeeRole": employee_role,
#             "EmployeeVerificationType": employee_verification_type
#         })
#         print("eBioserver UpdateEmployee result:", result)
#         return result
#     except Exception as e:
#         print("Error syncing with eBioserver:", e)
#         return None


#user face add

from zeep import Client
from django.conf import settings

def enroll_user_face(biouser, is_overwrite=False, command_id=0):
    wsdl = settings.ESSL_API_WSDL
    api_key = settings.ESSL_API_KEY
    serial_number = settings.ESSL_SERIAL_NUMBER
    username = settings.ESSL_USERNAME
    password = settings.ESSL_PASSWORD

    client = Client(wsdl=wsdl)
    employee_code = biouser.employeeid
    try:
        result = client.service.EnrollUserFace(
            APIKey=api_key,
            EmployeeCode=employee_code,
            isOverWrite=is_overwrite,
            SerialNumber=serial_number,
            UserName=username,
            UserPassword=password,
            CommandId=command_id
        )
        print("EnrollUserFace request:", {
            "APIKey": api_key,
            "EmployeeCode": employee_code,
            "isOverWrite": is_overwrite,
            "SerialNumber": serial_number,
            "UserName": username,
            "UserPassword": password,
            "CommandId": command_id
        })
        print("EnrollUserFace result:", result)
        return result
    except Exception as e:
        print("Error enrolling user face:", e)
        return None
    

from zeep import Client
from django.conf import settings

def enroll_user_fp(
    biouser,
    finger_index_number=1,  # 1 for right thumb, 2 for right index, etc.
    is_overwrite=False,
    command_id=0
):
    wsdl = settings.ESSL_API_WSDL
    api_key = settings.ESSL_API_KEY
    serial_number = settings.ESSL_SERIAL_NUMBER
    username = settings.ESSL_USERNAME
    password = settings.ESSL_PASSWORD

    client = Client(wsdl=wsdl)
    employee_code = biouser.employeeid
    try:
        result = client.service.EnrollUserFP(
            APIKey=api_key,
            EmployeeCode=employee_code,
            FingerIndexNumber=finger_index_number,
            isOverWrite=is_overwrite,
            SerialNumber=serial_number,
            UserName=username,
            UserPassword=password,
            CommandId=command_id
        )
        print("EnrollUserFP request:", {
            "APIKey": api_key,
            "EmployeeCode": employee_code,
            "FingerIndexNumber": finger_index_number,
            "isOverWrite": is_overwrite,
            "SerialNumber": serial_number,
            "UserName": username,
            "UserPassword": password,
            "CommandId": command_id
        })
        print("EnrollUserFP result:", result)
        return result
    except Exception as e:
        print("Error enrolling user fingerprint:", e)
    

#ebio fp


# from zeep import Client
# from django.conf import settings

# def enroll_user_fp_ebio(
#     biouser,
#     device_serial_number,
#     fp_index=1  # 1 for right thumb, 2 for right index, etc.
# ):
#     wsdl = settings.EBIO_API_WSDL
#     username = settings.EBIO_USERNAME
#     password = settings.EBIO_PASSWORD

#     client = Client(wsdl=wsdl)
#     employee_code = biouser.employeeid

#     try:
#         result = client.service.DeviceCommand_EnrollFP(
#             UserName=username,
#             Password=password,
#             DeviceSerialNumber=device_serial_number,
#             EmployeeCode=employee_code,
#             FPIndex=str(fp_index)  # API expects string
#         )
#         print("DeviceCommand_EnrollFP request:", {
#             "UserName": username,
#             "Password": password,
#             "DeviceSerialNumber": device_serial_number,
#             "EmployeeCode": employee_code,
#             "FPIndex": str(fp_index)
#         })
#         print("DeviceCommand_EnrollFP result:", result)
#         return result
#     except Exception as e:
#         print("Error enrolling fingerprint in eBioserver:", e)
#         return None


from zeep import Client
from django.conf import settings

def delete_employee_from_essl(biouser, command_id=0):
    wsdl = settings.ESSL_API_WSDL
    api_key = settings.ESSL_API_KEY
    serial_number = settings.ESSL_SERIAL_NUMBER
    username = settings.ESSL_USERNAME
    password = settings.ESSL_PASSWORD

    client = Client(wsdl=wsdl)
    employee_code = biouser.employeeid
    try:
        result = client.service.DeleteUser(
            APIKey=api_key,
            EmployeeCode=employee_code,
            SerialNumber=serial_number,
            UserName=username,
            UserPassword=password,
            CommandId=command_id
        )
        print("Deleting from eSSL:", {
            "APIKey": api_key,
            "EmployeeCode": employee_code,
            "SerialNumber": serial_number,
            "UserName": username,
            "UserPassword": password,
            "CommandId": command_id
        })
        print("eSSL DeleteUser result:", result)
        return result
    except Exception as e:
        print("Error deleting from eSSL:", e)
        return None


#transaction logs

from zeep import Client
from django.conf import settings
from datetime import datetime

def get_transactions_log(from_datetime, to_datetime, serial_number=None, str_data_list=""):
    wsdl = settings.ESSL_API_WSDL
    username = settings.ESSL_USERNAME
    password = settings.ESSL_PASSWORD
    serial_number = serial_number or settings.ESSL_SERIAL_NUMBER

    client = Client(wsdl=wsdl)
    try:
        result = client.service.GetTransactionsLog(
            FromDateTime=from_datetime,   # e.g. "2024-08-08 00:00:00"
            ToDateTime=to_datetime,       # e.g. "2024-08-08 23:59:59"
            SerialNumber=serial_number,
            UserName=username,
            UserPassword=password,
            strDataList=str_data_list
        )
        print("GetTransactionsLog result:", result)
        return result
    except Exception as e:
        print("Error fetching transactions log from eSSL:", e)
        return None
    


#Add multiple employees 

import json
from zeep import Client
from django.conf import settings

def add_multiple_employees_to_db(employees):
    wsdl = settings.ESSL_API_WSDL
    username = settings.ESSL_USERNAME
    password = settings.ESSL_PASSWORD

    # Convert list of dicts to JSON string
    employees_json = json.dumps(employees)

    client = Client(wsdl=wsdl)
    try:
        result = client.service.AddMultipleEmployeesToDB(
            EmployeesDataInJsonFormat=employees_json,
            UserName=username,
            UserPassword=password,
            ErrorStatus=""
        )
        print("AddMultipleEmployeesToDB result:", result)
        return result
    except Exception as e:
        print("Error adding multiple employees:", e)
        return None
    


    