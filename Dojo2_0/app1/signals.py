import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import OJTScore, Score, SkillMatrix, TraineeInfo, MasterTable, Station, HierarchyStructure, OperatorPerformanceEvaluation


def run_after_delay(func, delay, *args, **kwargs):
    """Run a function after N seconds without blocking request"""
    timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
    timer.start()

def update_skill_matrix(employee, station, level, verbose=True):
    """
    ##Update SkillMatrix when OJT, Evaluation, AND Ten Cycle are all passed
    Update SkillMatrix when OJT (for THIS station/level), Evaluation, AND Ten Cycle are all passed
    """
    if verbose:
        print("=" * 80)
        print(f"[SkillMatrix] Checking update for Employee: {employee.emp_id}, "
              f"Station: {station.station_name if station else '❌ None'}, "
              f"Level: {level.level_name if level else '❌ None'}")

    # ✅ Get TraineeInfo
    # ✅ Get TraineeInfo (Needed for name/doj and general status logging)
    # Filter by emp_id AND the specific station being certified to get the relevant record.
    # If the TraineeInfo record is unique per employee, we must fetch the correct one.
    # Since TraineeInfo has a ForeignKey to Station, we must use the 'station' parameter.

    # trainee_info = TraineeInfo.objects.filter(emp_id=employee.emp_id).first()

    trainee_info = TraineeInfo.objects.filter(emp_id=employee.emp_id, station=station).first()
    if not trainee_info:
        if verbose:
            # print(f"[SkillMatrix][ERROR] No TraineeInfo found for Employee: {employee.emp_id}")
            print(f"[SkillMatrix][ERROR] No TraineeInfo found for Employee: {employee.emp_id} at Station: {station.station_name}")
            # If no TraineeInfo exists for this station/skill, OJT cannot be complete.
            print("=" * 80)
        return

    if verbose:
        print(f"[SkillMatrix] Found TraineeInfo → Name: {trainee_info.trainee_name}, "
              f"Status: {trainee_info.status}, DOJ: {trainee_info.doj}")

    # -------------------------
    # 1. Check if OJT is passed for THIS Station/Level
    # -------------------------
    ojt_pass = False

    # CRITICAL CHANGE: We rely on the TraineeInfo.status only if it applies to this station.
    # The TraineeInfoViewSet logic is now responsible for setting this status correctly 
    # based on OJT scores associated with this trainee/station.
    if trainee_info.status == "Pass":

        # Additional Sanity Check: Ensure there's a score linked to the trainee for the target level.
        # This prevents a scenario where the status was manually set to 'Pass' without any scores.
        # ojt_exists = OJTScore.objects.filter(
        ojt_exists_for_station_level = OJTScore.objects.filter(
            # Filter by the TraineeInfo instance, which is already scoped by station in the fetch above.
            trainee__emp_id=employee.emp_id,
            topic__level=level
        ).exists()

        # ojt_pass = ojt_exists
        # OJT is passed only if the trainee's status is "Pass" AND scores actually exist for this level.
        ojt_pass = ojt_exists_for_station_level
        if verbose:
            # print(f"[SkillMatrix] OJT status=Pass, OJTScore exists for this level: {ojt_exists}")
            print(f"[SkillMatrix] OJT status is {trainee_info.status}. OJTScore exists for THIS trainee/level: {ojt_exists_for_station_level}")
    else:
        if verbose:
            print(f"[SkillMatrix] OJT not passed → Trainee status is {trainee_info.status}")

    if verbose:
        print(f"[SkillMatrix] Final OJT passed = {ojt_pass}")

    # -------------------------
    # 2. Check if Evaluation is passed
    # -------------------------
    eval_pass = Score.objects.filter(
        employee=employee,
        skill=station,
        level=level,
        passed=True
    ).exists()
    if verbose:
        print(f"[SkillMatrix] Evaluation passed = {eval_pass}")
        
    # -------------------------
    # 3. --- NEW --- Check if Ten Cycle is passed
    # -------------------------
    tencycle_pass = OperatorPerformanceEvaluation.objects.filter(
        employee=employee,
        station=station,
        level=level,
        final_status="Pass"
    ).exists()
    if verbose:
        print(f"[SkillMatrix] Ten Cycle passed = {tencycle_pass}")

    # -------------------------
    # Update or create SkillMatrix if ALL THREE conditions are met
    # -------------------------
    # --- MODIFIED --- Added the new `tencycle_pass` variable to the condition
    if ojt_pass and eval_pass and tencycle_pass:
        hierarchy = HierarchyStructure.objects.filter(station=station).first()
        if not hierarchy:
            if verbose:
                print(f"[SkillMatrix][ERROR] No HierarchyStructure found for Station: {station.station_name}")
                print("=" * 80)
            return

        obj, created = SkillMatrix.objects.update_or_create(
            employee=employee,
            # level=level,
            hierarchy=hierarchy,
            defaults={
                "employee_name": trainee_info.trainee_name,
                "emp_id": trainee_info.emp_id,
                "doj": trainee_info.doj,
                # "hierarchy": hierarchy,
                "level":level,
            }
        )
        if verbose:
            if created:
                print(f"[SkillMatrix] ✅ SkillMatrix created for Employee: {employee.emp_id}")
            else:
                print(f"[SkillMatrix] 🔄 SkillMatrix updated for Employee: {employee.emp_id}")
    else:
        if verbose:
            # --- MODIFIED --- Updated the print statement to show the new condition's status
            print(f"[SkillMatrix] ❌ Not updating. Conditions → OJT: {ojt_pass}, Eval: {eval_pass}, TenCycle: {tencycle_pass}")

    if verbose:
        print("=" * 80)




# -------------------------
# Signal for OJTScore
# -------------------------
# @receiver(post_save, sender=OJTScore)
# def update_skill_on_ojt_save(sender, instance, **kwargs):
#     print(f"[Signal][OJTScore] Saved → Trainee {instance.trainee.emp_id}, Score={instance.score}, Topic={instance.topic}")
#     try:
#         employee = MasterTable.objects.get(emp_id=instance.trainee.emp_id)
#         station = Station.objects.get(station_name=instance.trainee.station)
#     except MasterTable.DoesNotExist:
#         print(f"[Signal][ERROR] MasterTable not found for emp_id: {instance.trainee.emp_id}")
#         return
#     except Station.DoesNotExist:
#         print(f"[Signal][ERROR] Station not found: {instance.trainee.station}")
#         return

#     # ⏳ Delay 5 seconds before running the update
#     run_after_delay(update_skill_matrix, 5, employee, station, instance.topic.level, True)
##########################################################
# @receiver(post_save, sender=OJTScore)
# def update_skill_on_ojt_save(sender, instance, **kwargs):
#     print(f"[Signal][OJTScore] Saved → Trainee {instance.trainee.emp_id}, Score={instance.score}, Topic={instance.topic}")
#     try:
#         employee = MasterTable.objects.get(emp_id=instance.trainee.emp_id)
#         if not instance.trainee.station:
#             print(f"[Signal][ERROR] No station for trainee {instance.trainee.emp_id}")
#             return
            
#         # --- CHANGE THIS ---
#         # Instead of getting the ID, get the whole object.
#         station_object = instance.trainee.station 
        
#     except MasterTable.DoesNotExist:
#         print(f"[Signal][ERROR] MasterTable not found for emp_id: {instance.trainee.emp_id}")
#         return
#     except Exception as e:
#         print(f"[Signal][ERROR] Station access failed: {e}")
#         return

#     # --- AND CHANGE THIS ---
#     # Pass the full station_object to the function.
#     run_after_delay(update_skill_matrix, 5, employee, station_object, instance.topic.level, True)
###########################################3
# -------------------------
# Signal for Score
# -------------------------
@receiver(post_save, sender=Score)
def update_skill_on_eval_save(sender, instance, **kwargs):
    print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, Skill={instance.skill}, Level={instance.level}, Passed={instance.passed}")
    if not instance.skill or not instance.level:
        print(f"[Signal][ERROR] Score missing skill or level → {instance}")
        return

    # ⏳ Delay 5 seconds before running the update
    run_after_delay(update_skill_matrix, 5, instance.employee, instance.skill, instance.level, True)



@receiver(post_save, sender=OperatorPerformanceEvaluation)
def update_skill_on_performance_eval_save(sender, instance, **kwargs):
    """
    This new signal triggers the check whenever a Ten Cycle evaluation is saved.
    """
    print(f"[Signal][OperatorPerformanceEvaluation] Saved → Employee {instance.employee.emp_id}, "
          f"Station={instance.station}, Level={instance.level}, Status={instance.final_status}")

    # Ensure all required fields are present before proceeding
    if not instance.employee or not instance.station or not instance.level:
        print(f"[Signal][ERROR] Performance Evaluation missing employee, station, or level → {instance}")
        return

    # Call the same central logic function
    run_after_delay(update_skill_matrix, 5, instance.employee, instance.station, instance.level, True)

"""




# Django signals for automatic notification generation
# Handles real-time notification triggers for various system events
# """


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Notification, MasterTable, Score, User
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

def create_notification(
    title, message, notification_type, recipient=None, recipient_email=None, 
    employee=None, priority='medium', metadata=None
):
    try:
        logger.info(f"Creating notification: {title} for {recipient.email if recipient else recipient_email}")
        notification = Notification.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            recipient=recipient,
            recipient_email=recipient_email or (recipient.email if recipient else None),
            employee=employee,
            priority=priority,
            metadata=metadata or {},
            is_sent=False
        )
        return notification
    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        return None

def get_admin_users():
    try:
        admin_users = User.objects.filter(role__name__in=['admin', 'management'])
        logger.info(f"Found {admin_users.count()} admin/management users")
        if not admin_users.exists():
            logger.warning("No admin users found, falling back to first 5 users")
            return User.objects.all()[:5]
        return admin_users
    except Exception as e:
        logger.error(f"Error fetching admin users: {str(e)}")
        return User.objects.none()

def get_employee_user(employee):
    try:
        user = User.objects.get(email=employee.email)
        logger.info(f"Found user by email: {user.email} for employee {employee.emp_id}")
        return user
    except User.DoesNotExist:
        try:
            user = User.objects.get(employeeid=employee.emp_id)
            logger.info(f"Found user by employeeid: {user.email} for employee {employee.emp_id}")
            return user
        except User.DoesNotExist:
            logger.warning(f"No user found for employee {employee.emp_id}")
            return None
    except Exception as e:
        logger.error(f"Error finding user for employee {employee.emp_id}: {str(e)}")
        return None

@receiver(post_save, sender=MasterTable)
def notify_employee_registration(sender, instance, created, **kwargs):
    logger.info(f"Signal triggered for MasterTable, emp_id={instance.emp_id}, created={created}")
    if created:
        try:
            admin_users = get_admin_users()
            full_name = f"{instance.first_name} {instance.last_name or ''}".strip()
            department_name = instance.department.department_name if instance.department else "Not Assigned"
            
            for admin in admin_users:
                logger.info(f"Notifying admin: {admin.email}")
                create_notification(
                    title="New Employee Registered",
                    message=f"New employee {full_name} (ID: {instance.emp_id}) has been registered in the system.",
                    notification_type='employee_registration',
                    recipient=admin,
                    employee=instance,
                    priority='medium',
                    metadata={
                        'emp_id': instance.emp_id,
                        'email': instance.email,
                        'phone': instance.phone,
                        'department': department_name,
                        'date_of_joining': instance.date_of_joining.isoformat() if instance.date_of_joining else None,
                        'sex': instance.get_sex_display() if instance.sex else None,
                        'auto_generated': True
                    }
                )

            user = get_employee_user(instance)
            if user:
                logger.info(f"Notifying employee: {user.email}")
                create_notification(
                    title="Welcome to the System",
                    message=f"Welcome, {full_name}! Your employee profile (ID: {instance.emp_id}) has been created.",
                    notification_type='employee_registration',
                    recipient=user,
                    employee=instance,
                    priority='low',
                    metadata={
                        'emp_id': instance.emp_id,
                        'department': department_name,
                        'auto_generated': True
                    }
                )
        except Exception as e:
            logger.error(f"Error creating employee registration notification: {str(e)}")

@receiver(post_save, sender=Score)
def notify_test_assigned_and_completed(sender, instance, created, **kwargs):
    logger.info(f"Signal triggered for Score, employee={instance.employee.emp_id}, created={created}")
    try:
        admin_users = get_admin_users()
        test_name = instance.test.test_name if instance.test else "Test"
        full_name = f"{instance.employee.first_name} {instance.employee.last_name or ''}".strip()
        
        if created:
            for admin in admin_users:
                logger.info(f"Notifying admin: {admin.email}")
                create_notification(
                    title="Test Assigned",
                    message=f"Test '{test_name}' has been assigned to {full_name}.",
                    notification_type='test_assigned',
                    recipient=admin,
                    employee=instance.employee,
                    priority='medium',
                    metadata={
                        'test_name': test_name,
                        'test_id': instance.test.key_id if instance.test else None,
                        'emp_id': instance.employee.emp_id,
                        'level': str(instance.level) if instance.level else None,
                        'skill': str(instance.skill) if instance.skill else None,
                        'auto_generated': True
                    }
                )
        else:
            if instance.passed is not None:
                status = "Passed" if instance.passed else "Failed"
                priority = 'high' if not instance.passed else 'medium'
                
                for admin in admin_users:
                    logger.info(f"Notifying admin: {admin.email}")
                    create_notification(
                        title="Evaluation Completed",
                        message=f"{full_name} completed evaluation with {instance.percentage}% ({status}).",
                        notification_type='evaluation_completed',
                        recipient=admin,
                        employee=instance.employee,
                        priority=priority,
                        metadata={
                            'test_id': instance.test.key_id if instance.test else None,
                            'emp_id': instance.employee.emp_id,
                            'marks': instance.marks,
                            'percentage': str(instance.percentage),
                            'passed': instance.passed,
                            'auto_generated': True
                        }
                    )

                user = get_employee_user(instance.employee)
                if user:
                    logger.info(f"Notifying employee: {user.email}")
                    create_notification(
                        title="Your Evaluation Results",
                        message=f"You scored {instance.percentage}% ({status}).",
                        notification_type='evaluation_completed',
                        recipient=user,
                        employee=instance.employee,
                        priority=priority,
                        metadata={
                            'test_id': instance.test.key_id if instance.test else None,
                            'marks': instance.marks,
                            'percentage': str(instance.percentage),
                            'passed': instance.passed,
                            'auto_generated': True
                        }
                    )
    except Exception as e:
        logger.error(f"Error creating test notification: {str(e)}")



# import threading
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Score, SkillMatrix, HierarchyStructure


# # ----------------------------------------
# # Helper: Run function after a delay
# # ----------------------------------------
# def run_after_delay(func, delay, *args, **kwargs):
#     """Run a function after N seconds without blocking request"""
#     timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
#     timer.start()


# # ----------------------------------------
# # Core logic: create/update SkillMatrix
# # ----------------------------------------
# def process_score_for_skillmatrix(score):
#     """
#     ✅ Create/Update SkillMatrix if:
#       - skill = General
#       - level = Level 1
#     """
#     if not score.skill or not score.level:
#         return

#     if score.skill.station_name != "General":
#         return

#     if score.level.level_name != "Level 1":
#         return

#     employee = score.employee

#     try:
#         # ✅ Find hierarchy for this station
#         hierarchy = HierarchyStructure.objects.filter(station=score.skill).first()
#         if not hierarchy:
#             print(f"[SkillMatrix][ERROR] No hierarchy found for station={score.skill}")
#             return

#         # ✅ Create or update SkillMatrix
#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             level=score.level,
#             defaults={
#                 "employee_name": employee.emp_name,   # adjust if field name differs
#                 "emp_id": employee.emp_id,
#                 "doj": employee.doj,
#             },
#         )

#         if created:
#             print(f"[SkillMatrix] ✅ Created for {employee.emp_id} ({employee.emp_name}) at {hierarchy.station}")
#         else:
#             print(f"[SkillMatrix] 🔄 Updated for {employee.emp_id} ({employee.emp_name}) at {hierarchy.station}")

#     except Exception as e:
#         print(f"[SkillMatrix][ERROR] Failed for Score ID={score.id}: {e}")


# # ----------------------------------------
# # Signal: when Score is saved
# # ----------------------------------------
# @receiver(post_save, sender=Score)
# def create_skill_matrix_from_score(sender, instance, **kwargs):
#     print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, "
#           f"Skill={instance.skill}, Level={instance.level}")

#     # ✅ Run with 5s delay
#     run_after_delay(process_score_for_skillmatrix, 5, instance)


from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SkillMatrix, MachineAllocation

@receiver(post_save, sender=SkillMatrix)
def update_allocation_status_on_level_change(sender, instance, created, **kwargs):
    """
    Signal to update allocation status when an employee's level changes
    """
    if not created:  # Only for updates, not new creations
        # Get all pending allocations for this employee
        pending_allocations = MachineAllocation.objects.filter(
            employee=instance,
            approval_status='pending'
        )
        
        for allocation in pending_allocations:
            try:
                employee_level_value = instance.level.level_id
                machine_level_value = allocation.machine.level
                
                # Check if employee now meets the machine level requirement
                if employee_level_value >= machine_level_value:
                    allocation.approval_status = 'approved'
                    allocation.save()
                    print(f"Auto-approved allocation: {allocation}")
                    
            except (ValueError, AttributeError) as e:
                print(f"Error updating allocation {allocation.id}: {e}")
                continue



from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SkillMatrix, MultiSkilling

@receiver(post_save, sender=SkillMatrix)
def mark_multiskilling_completed(sender, instance, **kwargs):
    """
    Whenever a SkillMatrix entry is saved, check if there is a scheduled MultiSkilling
    for the same employee + station + skill_level, and mark it as completed.
    """
    employee = instance.employee
    station = getattr(instance.hierarchy, "station", None)
    level = instance.level  

    if not station or not level:
        return  

    MultiSkilling.objects.filter(
        employee=employee,
        station=station,
        skill_level=level
    ).exclude(status="completed").update(status="completed")



import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Score, SkillMatrix, HierarchyStructure


# ----------------------------------------
# Helper: Run function after a delay
# ----------------------------------------
def run_after_delay(func, delay, *args, **kwargs):
    """Run a function after N seconds without blocking request"""
    timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
    timer.start()


# ----------------------------------------
# Core logic: create/update SkillMatrix
# ----------------------------------------
# def process_score_for_skillmatrix(score):
#     """
#     ✅ Create/Update SkillMatrix if:
#       - skill = General
#       - level = Level 1
#     """
#     if not score.skill or not score.level:
#         return

#     if score.skill.station_name != "General":
#         return

#     if score.level.level_name != "Level 1":
#         return

#     employee = score.employee

#     try:
#         # ✅ Find hierarchy for this station
#         hierarchy = HierarchyStructure.objects.filter(station=score.skill).first()
#         if not hierarchy:
#             print(f"[SkillMatrix][ERROR] No hierarchy found for station={score.skill}")
#             return

#         # ✅ Create or update SkillMatrix
#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             level=score.level,
#             defaults={
#                 "employee_name": employee.first_name,   # adjust if field name differs
#                 "emp_id": employee.emp_id,
#                 "doj": employee.date_of_joining,
#             },
#         )

#         if created:
#             print(f"[SkillMatrix] ✅ Created for {employee.emp_id} ({employee.first_name}) at {hierarchy.station}")
#         else:
#             print(f"[SkillMatrix] 🔄 Updated for {employee.emp_id} ({employee.first_name}) at {hierarchy.station}")

#     except Exception as e:
#         print(f"[SkillMatrix][ERROR] Failed for Score ID={score.id}: {e}")



def process_score_for_skillmatrix(score):
    """
    ✅ Create/Update SkillMatrix if:
      - score represents a PASS
      - skill = General
      - level = Level 1
    """
    if not score.skill or not score.level:
        return

    # ✅ NEW: Check if the employee passed the exam.
    #    Adjust 'score.passed' to the actual field name in your Score model.
    if not getattr(score, 'passed', False):
        print(f"[SkillMatrix] ⏭️  Skipping update for {score.employee.emp_id} - Score was not a pass.")
        return

    if score.skill.station_name != "General":
        return

    if score.level.level_name != "Level 1":
        return

    employee = score.employee

    try:
        # ✅ Find hierarchy for this station
        hierarchy = HierarchyStructure.objects.filter(station=score.skill).first()
        if not hierarchy:
            print(f"[SkillMatrix][ERROR] No hierarchy found for station={score.skill}")
            return

        # ✅ Create or update SkillMatrix
        obj, created = SkillMatrix.objects.update_or_create(
            employee=employee,
            hierarchy=hierarchy,
            level=score.level,
            defaults={
                "employee_name": employee.first_name,
                "emp_id": employee.emp_id,
                "doj": employee.date_of_joining,
            },
        )

        if created:
            print(f"[SkillMatrix] ✅ Created for {employee.emp_id} ({employee.first_name}) at {hierarchy.station}")
        else:
            print(f"[SkillMatrix] 🔄 Updated for {employee.emp_id} ({employee.first_name}) at {hierarchy.station}")

    except Exception as e:
        print(f"[SkillMatrix][ERROR] Failed for Score ID={score.id}: {e}")

# ... (The signal receiver remains the same)




# ----------------------------------------
# Signal: when Score is saved
# ----------------------------------------
@receiver(post_save, sender=Score)
def create_skill_matrix_from_score(sender, instance, **kwargs):
    print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, "
          f"Skill={instance.skill}, Level={instance.level}")

    # ✅ Run with 5s delay
    run_after_delay(process_score_for_skillmatrix, 5, instance)




# #10 cycle + Evaluation

# import threading
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import (
#     Score,
#     SkillMatrix,
#     MasterTable,
#     Station,
#     HierarchyStructure,
#     OperatorPerformanceEvaluation,
# )


# # ----------------------------------------
# # Helper: Run after delay
# # ----------------------------------------
# def run_after_delay(func, delay, *args, **kwargs):
#     """Run a function after N seconds without blocking request"""
#     timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
#     timer.start()


# # ----------------------------------------
# # Core logic: update SkillMatrix
# # ----------------------------------------
# def process_skill_matrix_update(employee, station, level, verbose=True):
#     """
#     ✅ Update SkillMatrix when BOTH:
#       - OperatorPerformanceEvaluation = Pass
#       - Score = Passed
#     """
#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix] Checking update for Employee: {employee.emp_id}, "
#               f"Station: {station.station_name if station else '❌ None'}, "
#               f"Level: {level.level_name if level else '❌ None'}")

#     # -------------------------
#     # Check Operator Performance Evaluation
#     # -------------------------
#     eval_exists = OperatorPerformanceEvaluation.objects.filter(
#         employee=employee,
#         station=station,
#         level=level,
#         final_status="Pass"
#     ).exists()

#     if verbose:
#         print(f"[SkillMatrix] OperatorPerformanceEvaluation Pass = {eval_exists}")

#     # -------------------------
#     # Check Score (Evaluation test)
#     # -------------------------
#     score_pass = Score.objects.filter(
#         employee=employee,
#         skill=station,
#         level=level,
#         passed=True
#     ).exists()

#     if verbose:
#         print(f"[SkillMatrix] Score passed = {score_pass}")

#     # -------------------------
#     # Update SkillMatrix if both true
#     # -------------------------
#     if eval_exists and score_pass:
#         hierarchy = HierarchyStructure.objects.filter(station=station).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix][ERROR] No HierarchyStructure found for Station: {station.station_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             # level=level,
#             hierarchy=hierarchy,
#             defaults={
#                 "employee_name": employee.first_name,   # from MasterTable
#                 "emp_id": employee.emp_id,
#                 "doj": employee.date_of_joining,                  # from MasterTable
#                 # "hierarchy": hierarchy,
#                 "level":level,
#             }
#         )
#         if verbose:
#             if created:
#                 print(f"[SkillMatrix] ✅ Created for Employee: {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix] 🔄 Updated for Employee: {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix] ❌ Not updating. Conditions → EvalModel: {eval_exists}, Score: {score_pass}")

#     if verbose:
#         print("=" * 80)


# # ----------------------------------------
# # Signal for Score
# # ----------------------------------------
# @receiver(post_save, sender=Score)
# def trigger_skillmatrix_from_score(sender, instance, **kwargs):
#     print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, "
#           f"Skill={instance.skill}, Level={instance.level}, Passed={instance.passed}")

#     if not instance.skill or not instance.level:
#         print(f"[Signal][ERROR] Score missing skill or level → {instance}")
#         return

#     run_after_delay(process_skill_matrix_update, 5, instance.employee, instance.skill, instance.level, True)


# # ----------------------------------------
# # Signal for OperatorPerformanceEvaluation
# # ----------------------------------------
# @receiver(post_save, sender=OperatorPerformanceEvaluation)
# def trigger_skillmatrix_from_performance_eval(sender, instance, **kwargs):
#     print(f"[Signal][OperatorPerformanceEvaluation] Saved → Employee {instance.employee.emp_id}, "
#           f"Station={instance.station}, Level={instance.level}, Status={instance.final_status}")

#     run_after_delay(process_skill_matrix_update, 5, instance.employee, instance.station, instance.level, True)





# #Quantity OJT + Evaluation

# import threading
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Score, SkillMatrix, MasterTable, Station, HierarchyStructure, OJTLevel2Quantity


# # ----------------------------------------
# # Helper: Run function after a delay
# # ----------------------------------------
# def delayed_run(func, delay, *args, **kwargs):
#     """Run a function after N seconds without blocking request"""
#     timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
#     timer.start()


# # ----------------------------------------
# # Core logic: Update SkillMatrix
# # ----------------------------------------
# def update_skillmatrix_record(employee, station, level, verbose=True):
#     """
#     Update SkillMatrix when:
#       - OJTLevel2Quantity.status = 'Pass'
#       - Score.passed = True
#     """
#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix] Checking update for Employee: {employee.emp_id}, "
#               f"Station: {station.station_name if station else '❌ None'}, "
#               f"Level: {level.level_name if level else '❌ None'}")

#     # -------------------------
#     # Check OJTLevel2Quantity
#     # -------------------------
#     try:
#         ojt_entry = OJTLevel2Quantity.objects.filter(
#             emp_id=employee.emp_id,
#             level=level,
#             station_name=station.station_name,
#             status="Pass"
#         ).first()
#     except Exception:
#         ojt_entry = None

#     ojt_passed = ojt_entry is not None
#     if verbose:
#         print(f"[SkillMatrix] OJT passed = {ojt_passed}")

#     # -------------------------
#     # Check Score (Evaluation)
#     # -------------------------
#     score_passed = Score.objects.filter(
#         employee=employee,
#         skill=station,
#         level=level,
#         passed=True
#     ).exists()
#     if verbose:
#         print(f"[SkillMatrix] Score passed = {score_passed}")

#     # -------------------------
#     # Update SkillMatrix if both conditions are true
#     # -------------------------
#     if ojt_passed and score_passed:
#         hierarchy = HierarchyStructure.objects.filter(station=station).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix][ERROR] No HierarchyStructure found for Station: {station.station_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             level=level,
#             defaults={
#                 "employee_name": ojt_entry.trainee_name,
#                 "emp_id": ojt_entry.emp_id,
#                 "doj": ojt_entry.doj,
#                 "hierarchy": hierarchy,
#             }
#         )
#         if verbose:
#             if created:
#                 print(f"[SkillMatrix] ✅ Created SkillMatrix for Employee: {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix] 🔄 Updated SkillMatrix for Employee: {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix] ❌ Not updating. Conditions → OJT: {ojt_passed}, Score: {score_passed}")

#     if verbose:
#         print("=" * 80)


# # ----------------------------------------
# # Signal for OJTLevel2Quantity
# # ----------------------------------------
# @receiver(post_save, sender=OJTLevel2Quantity)
# def handle_ojt_save(sender, instance, **kwargs):
#     print(f"[Signal][OJTLevel2Quantity] Saved → Trainee {instance.trainee_name} ({instance.emp_id}), Status={instance.status}")
#     try:
#         employee = MasterTable.objects.get(emp_id=instance.emp_id)
#         station = Station.objects.get(station_name=instance.station_name)
#     except MasterTable.DoesNotExist:
#         print(f"[Signal][ERROR] MasterTable not found for emp_id: {instance.emp_id}")
#         return
#     except Station.DoesNotExist:
#         print(f"[Signal][ERROR] Station not found: {instance.station_name}")
#         return

#     # ⏳ Delay 5 seconds before running the update
#     delayed_run(update_skillmatrix_record, 5, employee, station, instance.level, True)


# # ----------------------------------------
# # Signal for Score
# # ----------------------------------------
# @receiver(post_save, sender=Score)
# def handle_score_save(sender, instance, **kwargs):
#     print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, Skill={instance.skill}, Level={instance.level}, Passed={instance.passed}")
#     if not instance.skill or not instance.level:
#         print(f"[Signal][ERROR] Score missing skill or level → {instance}")
#         return

#     # ⏳ Delay 5 seconds before running the update
#     delayed_run(update_skillmatrix_record, 5, instance.employee, instance.skill, instance.level, True)





# import threading
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import (
#     OJTScore,
#     Score,
#     SkillMatrix,
#     TraineeInfo,
#     MasterTable,
#     Station,
#     HierarchyStructure,
#     SkillMatrixFeatureFlag,   # <-- NEW model
# )


# # ----------------------------------------
# # Helper: check if feature is enabled
# # ----------------------------------------
# def is_feature_enabled(feature_name):
#     return SkillMatrixFeatureFlag.objects.filter(
#         feature_name=feature_name, enabled=True
#     ).exists()


# # ----------------------------------------
# # Helper: Run function after delay
# # ----------------------------------------
# def run_after_delay(func, delay, *args, **kwargs):
#     """Run a function after N seconds without blocking request"""
#     timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
#     timer.start()


# # ----------------------------------------
# # Core logic: update SkillMatrix
# # ----------------------------------------
# def update_skill_matrix(employee, station, level, verbose=True):
#     """
#     Update SkillMatrix when both OJT and Evaluation are passed
#     """
#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix] Checking update for Employee: {employee.emp_id}, "
#               f"Station: {station.station_name if station else '❌ None'}, "
#               f"Level: {level.level_name if level else '❌ None'}")

#     # ✅ Get TraineeInfo
#     trainee_info = TraineeInfo.objects.filter(emp_id=employee.emp_id).first()
#     if not trainee_info:
#         if verbose:
#             print(f"[SkillMatrix][ERROR] No TraineeInfo found for Employee: {employee.emp_id}")
#             print("=" * 80)
#         return

#     if verbose:
#         print(f"[SkillMatrix] Found TraineeInfo → Name: {trainee_info.trainee_name}, "
#               f"Status: {trainee_info.status}, DOJ: {trainee_info.doj}")

#     # -------------------------
#     # Check if OJT is passed
#     # -------------------------
#     ojt_pass = False
#     if trainee_info.status == "Pass":
#         ojt_exists = OJTScore.objects.filter(
#             trainee__emp_id=employee.emp_id,
#             topic__level=level
#         ).exists()
#         ojt_pass = ojt_exists
#         if verbose:
#             print(f"[SkillMatrix] OJT status=Pass, OJTScore exists for this level: {ojt_exists}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix] OJT not passed → Trainee status is {trainee_info.status}")

#     if verbose:
#         print(f"[SkillMatrix] Final OJT passed = {ojt_pass}")

#     # -------------------------
#     # Check if Evaluation is passed
#     # -------------------------
#     eval_pass = Score.objects.filter(
#         employee=employee,
#         skill=station,
#         level=level,
#         passed=True
#     ).exists()
#     if verbose:
#         print(f"[SkillMatrix] Evaluation passed = {eval_pass}")

#     # -------------------------
#     # Update or create SkillMatrix
#     # -------------------------
#     if ojt_pass and eval_pass:
#         hierarchy = HierarchyStructure.objects.filter(station=station).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix][ERROR] No HierarchyStructure found for Station: {station.station_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             level=level,
#             defaults={
#                 "employee_name": trainee_info.trainee_name,
#                 "emp_id": trainee_info.emp_id,
#                 "doj": trainee_info.doj,
#                 "hierarchy": hierarchy,
#             }
#         )
#         if verbose:
#             if created:
#                 print(f"[SkillMatrix] ✅ SkillMatrix created for Employee: {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix] 🔄 SkillMatrix updated for Employee: {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix] ❌ Not updating. Conditions → OJT: {ojt_pass}, Eval: {eval_pass}")

#     if verbose:
#         print("=" * 80)


# # ----------------------------------------
# # Signal for OJTScore
# # ----------------------------------------
# @receiver(post_save, sender=OJTScore)
# def update_skill_on_ojt_save(sender, instance, **kwargs):
#     if not is_feature_enabled("ojt_evaluation"):
#         return  # 🚫 disabled via frontend toggle

#     print(f"[Signal][OJTScore] Saved → Trainee {instance.trainee.emp_id}, "
#           f"Score={instance.score}, Topic={instance.topic}")
#     try:
#         employee = MasterTable.objects.get(emp_id=instance.trainee.emp_id)
#         station = Station.objects.get(station_name=instance.trainee.station)
#     except MasterTable.DoesNotExist:
#         print(f"[Signal][ERROR] MasterTable not found for emp_id: {instance.trainee.emp_id}")
#         return
#     except Station.DoesNotExist:
#         print(f"[Signal][ERROR] Station not found: {instance.trainee.station}")
#         return

#     # ⏳ Delay 5 seconds before running the update
#     run_after_delay(update_skill_matrix, 5, employee, station, instance.topic.level, True)


# # ----------------------------------------
# # Signal for Score
# # ----------------------------------------
# @receiver(post_save, sender=Score)
# def update_skill_on_eval_save(sender, instance, **kwargs):
#     if not is_feature_enabled("ojt_evaluation"):
#         return  # 🚫 disabled via frontend toggle

#     print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, "
#           f"Skill={instance.skill}, Level={instance.level}, Passed={instance.passed}")
#     if not instance.skill or not instance.level:
#         print(f"[Signal][ERROR] Score missing skill or level → {instance}")
#         return

#     # ⏳ Delay 5 seconds before running the update
#     run_after_delay(update_skill_matrix, 5, instance.employee, instance.skill, instance.level, True)




















import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import (
    Score,
    SkillMatrix,
    MasterTable,
    Station,
    HierarchyStructure,
    OperatorPerformanceEvaluation,
    SkillMatrixFeatureFlag,   # <-- add this
)


# ----------------------------------------
# Helper: check if feature is enabled
# ----------------------------------------
def is_feature_enabled(feature_name: str) -> bool:
    return SkillMatrixFeatureFlag.objects.filter(
        feature_name=feature_name, enabled=True
    ).exists()


# ----------------------------------------
# Helper: Run after delay
# ----------------------------------------
# def run_after_delay(func, delay, *args, **kwargs):
#     """Run a function after N seconds without blocking request"""
#     timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
#     timer.start()


# # ----------------------------------------
# # Core logic: update SkillMatrix
# # ----------------------------------------
# def process_skill_matrix_update(employee, station, level, verbose=True):
#     """
#     ✅ Update SkillMatrix when BOTH:
#       - OperatorPerformanceEvaluation = Pass
#       - Score = Passed
#     """
#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix] Checking update for Employee: {employee.emp_id}, "
#               f"Station: {station.station_name if station else '❌ None'}, "
#               f"Level: {level.level_name if level else '❌ None'}")

#     # -------------------------
#     # Check Operator Performance Evaluation
#     # -------------------------
#     eval_exists = OperatorPerformanceEvaluation.objects.filter(
#         employee=employee,
#         station=station,
#         level=level,
#         final_status="Pass"
#     ).exists()

#     if verbose:
#         print(f"[SkillMatrix] OperatorPerformanceEvaluation Pass = {eval_exists}")

#     # -------------------------
#     # Check Score (Evaluation test)
#     # -------------------------
#     score_pass = Score.objects.filter(
#         employee=employee,
#         skill=station,
#         level=level,
#         passed=True
#     ).exists()

#     if verbose:
#         print(f"[SkillMatrix] Score passed = {score_pass}")

#     # -------------------------
#     # Update SkillMatrix if both true
#     # -------------------------
#     if eval_exists and score_pass:
#         hierarchy = HierarchyStructure.objects.filter(station=station).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix][ERROR] No HierarchyStructure found for Station: {station.station_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             # level=level,
#             hierarchy=hierarchy,
#             defaults={
#                 "employee_name": employee.first_name,   # from MasterTable
#                 "emp_id": employee.emp_id,
#                 "doj": employee.date_of_joining,        # from MasterTable
#                 # "hierarchy": hierarchy,
#                 "level":level
#             }
#         )
#         if verbose:
#             if created:
#                 print(f"[SkillMatrix] ✅ Created for Employee: {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix] 🔄 Updated for Employee: {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix] ❌ Not updating. Conditions → EvalModel: {eval_exists}, Score: {score_pass}")

#     if verbose:
#         print("=" * 80)


# # ----------------------------------------
# # Signal for Score
# # ----------------------------------------
# @receiver(post_save, sender=Score)
# def trigger_skillmatrix_from_score(sender, instance, **kwargs):
#     if not is_feature_enabled("cycle_evaluation"):
#         return  # 🚫 disabled via frontend toggle

#     print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, "
#           f"Skill={instance.skill}, Level={instance.level}, Passed={instance.passed}")

#     if not instance.skill or not instance.level:
#         print(f"[Signal][ERROR] Score missing skill or level → {instance}")
#         return

#     run_after_delay(process_skill_matrix_update, 5, instance.employee, instance.skill, instance.level, True)


# ----------------------------------------
# Signal for OperatorPerformanceEvaluation
# ----------------------------------------
@receiver(post_save, sender=OperatorPerformanceEvaluation)
def trigger_skillmatrix_from_performance_eval(sender, instance, **kwargs):
    if not is_feature_enabled("cycle_evaluation"):
        return  # 🚫 disabled via frontend toggle

    print(f"[Signal][OperatorPerformanceEvaluation] Saved → Employee {instance.employee.emp_id}, "
          f"Station={instance.station}, Level={instance.level}, Status={instance.final_status}")

    run_after_delay(process_skill_matrix_update, 5, instance.employee, instance.station, instance.level, True)





import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import (
    Score,
    SkillMatrix,
    MasterTable,
    Station,
    HierarchyStructure,
    OJTLevel2Quantity,
    SkillMatrixFeatureFlag,   # <-- NEW
)


# ----------------------------------------
# Helper: check if feature is enabled
# ----------------------------------------
def is_feature_enabled(feature_name: str) -> bool:
    return SkillMatrixFeatureFlag.objects.filter(
        feature_name=feature_name, enabled=True
    ).exists()


# ----------------------------------------
# Helper: Run function after a delay
# ----------------------------------------
def delayed_run(func, delay, *args, **kwargs):
    """Run a function after N seconds without blocking request"""
    timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
    timer.start()


# ----------------------------------------
# Core logic: Update SkillMatrix
# ----------------------------------------
def update_skillmatrix_record(employee, station, level, verbose=True):
    """
    Update SkillMatrix when:
      - OJTLevel2Quantity.status = 'Pass'
      - Score.passed = True
    """
    if verbose:
        print("=" * 80)
        print(f"[SkillMatrix] Checking update for Employee: {employee.emp_id}, "
              f"Station: {station.station_name if station else '❌ None'}, "
              f"Level: {level.level_name if level else '❌ None'}")

    # -------------------------
    # Check OJTLevel2Quantity
    # -------------------------
    try:
        ojt_entry = OJTLevel2Quantity.objects.filter(
            emp_id=employee.emp_id,
            level=level,
            station_name=station.station_name,
            status="Pass"
        ).first()
    except Exception:
        ojt_entry = None

    ojt_passed = ojt_entry is not None
    if verbose:
        print(f"[SkillMatrix] OJT passed = {ojt_passed}")

    # -------------------------
    # Check Score (Evaluation)
    # -------------------------
    score_passed = Score.objects.filter(
        employee=employee,
        skill=station,
        level=level,
        passed=True
    ).exists()
    if verbose:
        print(f"[SkillMatrix] Score passed = {score_passed}")

    # -------------------------
    # Update SkillMatrix if both conditions are true
    # -------------------------
    if ojt_passed and score_passed:
        hierarchy = HierarchyStructure.objects.filter(station=station).first()
        if not hierarchy:
            if verbose:
                print(f"[SkillMatrix][ERROR] No HierarchyStructure found for Station: {station.station_name}")
                print("=" * 80)
            return

        obj, created = SkillMatrix.objects.update_or_create(
            employee=employee,
            # level=level,
            hierarchy=hierarchy,
            defaults={
                "employee_name": ojt_entry.trainee_name,
                "emp_id": ojt_entry.emp_id,
                "doj": ojt_entry.doj,
                # "hierarchy": hierarchy,
                "level":level
            }
        )
        if verbose:
            if created:
                print(f"[SkillMatrix] ✅ Created SkillMatrix for Employee: {employee.emp_id}")
            else:
                print(f"[SkillMatrix] 🔄 Updated SkillMatrix for Employee: {employee.emp_id}")
    else:
        if verbose:
            print(f"[SkillMatrix] ❌ Not updating. Conditions → OJT: {ojt_passed}, Score: {score_passed}")

    if verbose:
        print("=" * 80)


# ----------------------------------------
# Signal for OJTLevel2Quantity
# ----------------------------------------
@receiver(post_save, sender=OJTLevel2Quantity)
def handle_ojt_save(sender, instance, **kwargs):
    if not is_feature_enabled("quantity_ojt_evaluation"):
        return  # 🚫 disabled from frontend toggle

    print(f"[Signal][OJTLevel2Quantity] Saved → Trainee {instance.trainee_name} ({instance.emp_id}), Status={instance.status}")
    try:
        employee = MasterTable.objects.get(emp_id=instance.emp_id)
        station = Station.objects.get(station_name=instance.station_name)
    except MasterTable.DoesNotExist:
        print(f"[Signal][ERROR] MasterTable not found for emp_id: {instance.emp_id}")
        return
    except Station.DoesNotExist:
        print(f"[Signal][ERROR] Station not found: {instance.station_name}")
        return

    # ⏳ Delay 5 seconds before running the update
    delayed_run(update_skillmatrix_record, 5, employee, station, instance.level, True)


# ----------------------------------------
# Signal for Score
# ----------------------------------------
@receiver(post_save, sender=Score)
def handle_score_save(sender, instance, **kwargs):
    if not is_feature_enabled("quantity_ojt_evaluation"):
        return  # 🚫 disabled from frontend toggle

    print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, "
          f"Skill={instance.skill}, Level={instance.level}, Passed={instance.passed}")
    if not instance.skill or not instance.level:
        print(f"[Signal][ERROR] Score missing skill or level → {instance}")
        return

    # ⏳ Delay 5 seconds before running the update
    delayed_run(update_skillmatrix_record, 5, instance.employee, instance.skill, instance.level, True)






#---------numax easytimepro --------------------------------------
import threading
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import SkillMatrix, BioUser, Machine, BiometricEnrollment, MasterTable, BiometricDevice, Level
from .services.easytime_client import EasyTimeClient
from django.db.models import Q
# ---------------------------------------------------
# HELPER TASK
# ---------------------------------------------------
def task_provision_user(bio_user, device, area_ids_list, specific_dept_id):
    if not device or not device.serial_number: return

    # Optional duplicate check (comment out to force updates)
    if BiometricEnrollment.objects.filter(bio_user=bio_user, device=device).exists():
        pass 

    client = EasyTimeClient()
    
    if not isinstance(area_ids_list, list):
        area_ids_list = [area_ids_list] if area_ids_list else []

    result = client.provision_employee_to_device(
        bio_user, 
        device.serial_number,
        area_ids=area_ids_list, 
        dept_id=specific_dept_id
    )
    
    if result.get('status') == 'success':
        BiometricEnrollment.objects.get_or_create(bio_user=bio_user, device=device)
        print(f"✅ Synced {bio_user.first_name} to {device.name} (Areas: {area_ids_list}, Dept: {specific_dept_id})")
    else:
        print(f"❌ Sync Failed for {device.name}: {result.get('message')}")


# ---------------------------------------------------
# SIGNAL 1: SKILL MATRIX UPDATE
# ---------------------------------------------------

@receiver(post_save, sender=SkillMatrix)
def skill_matrix_biometric_trigger(sender, instance, **kwargs):
    # 1. Validate Hierarchy
    if not instance.hierarchy or not instance.hierarchy.station:
        print(f"⚠️ SkillMatrix {instance.id} has no Station linked. Skipping.")
        return

    # --- FIX 1: Strict Machine Filtering (The Guard) ---
    # We access the Integer ID from the Level relation (instance.level.level_id)
    # and match it against the Machine's integer 'level' field.
    # This guarantees we ONLY get the Biometric Device for THIS specific level.
    try:
        target_level_id = instance.level.level_id 
    except AttributeError:
        print(f"⚠️ SkillMatrix {instance.id} has invalid Level relation.")
        return

    # --- CHANGE 1: Filter Machines (Less Than or Equal) ---
    # We want machines where machine.level <= user.level
    # 'lte' stands for Less Than or Equal
    eligible_machines = Machine.objects.filter(
        process=instance.hierarchy.station, # Must match Station
        # level=target_level_id,              # Must match Level ID (Integer)
        level__lte=target_level_id, # <--- THE KEY CHANGE (was 'level=')
        biometric_device__isnull=False
    ).select_related('biometric_device')

    if not eligible_machines.exists():
        # Debug log to confirm we skipped the wrong machines
        print(f"ℹ️ No biometric machines found for Station: {instance.hierarchy.station} @ Level ID: {target_level_id}")
        return

    # 3. Get/Create Local BioUser
    try:
        emp_record = MasterTable.objects.get(emp_id=instance.emp_id)
        bio_user, _ = BioUser.objects.update_or_create(
            employeeid=instance.emp_id,
            defaults={'first_name': emp_record.first_name, 'last_name': emp_record.last_name or ""}
        )
    except MasterTable.DoesNotExist:
        print(f"⚠️ Employee {instance.emp_id} not found in MasterTable.")
        return

    # 4. Prepare Data
    client = EasyTimeClient()

    # A. Department
    dept_name = emp_record.department.department_name if emp_record.department else "General"
    et_dept_id = client.ensure_department(dept_name)

    # B. Area Logic: Accumulate from ALL Skills
    all_user_skills = SkillMatrix.objects.filter(emp_id=instance.emp_id)
    target_areas = []
    
    for skill in all_user_skills:
        if skill.hierarchy and skill.hierarchy.station:
            
            ## --- FIX 2: Area Naming with UNIQUE ID ---
            ## Format: "StationName (SID) - L2"
            ## This solves the Duplicate Name conflict.
            #########################
            # try:
            #     lvl_name = skill.level.level_name 
            # except:
            #     lvl_name = "Unk"
            ############################3

            # --- CHANGE 2: Generate Areas for ALL Lower Levels ---
            # If user is Level 3, they need areas for Level 1, 2, AND 3.
            # We fetch all levels that are <= the skill's level.
            
            user_skill_level_id = skill.level.level_id
            
            # Find 1, 2, 3... up to current level
            qualifying_levels = Level.objects.filter(level_id__lte=user_skill_level_id)

            st_name = skill.hierarchy.station.station_name
            st_id = skill.hierarchy.station.station_id  # The Unique Database ID

            ## s_name = f"{skill.hierarchy.station.station_name} - L{lvl_name}"
            ## NEW NAME FORMAT: "Drilling (S12) - L2"

            # s_name = f"{st_name}(S{st_id})-L{lvl_name}"

            # a_id = client.ensure_area(s_name)
            # if a_id not in target_areas:
            #     target_areas.append(a_id)

            # Loop through all qualifying levels and add their areas
            for lvl in qualifying_levels:
                # Name: "Drilling(S12)-L1", "Drilling(S12)-L2", etc.
                s_name = f"{st_name}(S{st_id})-L{lvl.level_name}"
                
                a_id = client.ensure_area(s_name)
                if a_id not in target_areas:
                    target_areas.append(a_id)

    # print(f"--> Skill Sync: {bio_user.first_name} | Level: {target_level_id} | Areas: {target_areas}")
    print(f"--> Skill Sync: {bio_user.first_name} | Max Level: {target_level_id} | Areas: {target_areas}")

    # 5. Sync to Machines (Safe Loop)
    # 'eligible_machines' ONLY contains machines with the matching Level ID.
    # Therefore, we ONLY send commands to the correct Serial Numbers.

    # We send this Cumulative Area List to ALL machines (L1, L2, L3...)
    # This ensures the L4 user can open the L1 machine using the L1 area key we just added.
    for machine in eligible_machines:
        # Double check device existence
        if machine.biometric_device and machine.biometric_device.serial_number:
            print(f"   ↳ Sending to Device SN: {machine.biometric_device.serial_number} (Level {machine.level})")
            
            threading.Thread(
                target=task_provision_user, 
                args=(bio_user, machine.biometric_device, target_areas, et_dept_id)
            ).start()



# @receiver(post_save, sender=SkillMatrix)
# def skill_matrix_biometric_trigger(sender, instance, **kwargs):
#     # 1. Validate Hierarchy
#     if not instance.hierarchy or not instance.hierarchy.station:
#         print(f"⚠️ SkillMatrix {instance.id} has no Station linked. Skipping.")
#         return

#     # --- FIX 1: Strict Machine Filtering (The Guard) ---
#     # We access the Integer ID from the Level relation (instance.level.level_id)
#     # and match it against the Machine's integer 'level' field.
#     # This guarantees we ONLY get the Biometric Device for THIS specific level.
#     try:
#         target_level_id = instance.level.level_id 
#     except AttributeError:
#         print(f"⚠️ SkillMatrix {instance.id} has invalid Level relation.")
#         return

#     eligible_machines = Machine.objects.filter(
#         process=instance.hierarchy.station, # Must match Station
#         level=target_level_id,              # Must match Level ID (Integer)
#         biometric_device__isnull=False
#     ).select_related('biometric_device')

#     if not eligible_machines.exists():
#         # Debug log to confirm we skipped the wrong machines
#         print(f"ℹ️ No biometric machines found for Station: {instance.hierarchy.station} @ Level ID: {target_level_id}")
#         return

#     # 3. Get/Create Local BioUser
#     try:
#         emp_record = MasterTable.objects.get(emp_id=instance.emp_id)
#         bio_user, _ = BioUser.objects.update_or_create(
#             employeeid=instance.emp_id,
#             defaults={'first_name': emp_record.first_name, 'last_name': emp_record.last_name or ""}
#         )
#     except MasterTable.DoesNotExist:
#         print(f"⚠️ Employee {instance.emp_id} not found in MasterTable.")
#         return

#     # 4. Prepare Data
#     client = EasyTimeClient()

#     # A. Department
#     dept_name = emp_record.department.department_name if emp_record.department else "General"
#     et_dept_id = client.ensure_department(dept_name)

#     # B. Area Logic: Accumulate from ALL Skills
#     all_user_skills = SkillMatrix.objects.filter(emp_id=instance.emp_id)
#     target_areas = []
    
#     for skill in all_user_skills:
#         if skill.hierarchy and skill.hierarchy.station:
            
#             # --- FIX 2: Unique Area Naming ---
#             # Appends Level Name (e.g., "1", "2") to Area Name.
#             # Result: "Drilling - L2" (Distinct from "Drilling - L3")
#             # --- FIX 2: Area Naming with UNIQUE ID ---
#             # Format: "StationName (SID) - L2"
#             # This solves the Duplicate Name conflict.
#             try:
#                 lvl_name = skill.level.level_name 
#             except:
#                 lvl_name = "Unk"

#             st_name = skill.hierarchy.station.station_name
#             st_id = skill.hierarchy.station.station_id  # The Unique Database ID

#             # s_name = f"{skill.hierarchy.station.station_name} - L{lvl_name}"
#             # NEW NAME FORMAT: "Drilling (S12) - L2"
#             s_name = f"{st_name}(S{st_id})-L{lvl_name}"

#             a_id = client.ensure_area(s_name)
#             if a_id not in target_areas:
#                 target_areas.append(a_id)

#     print(f"--> Skill Sync: {bio_user.first_name} | Level: {target_level_id} | Areas: {target_areas}")

#     # 5. Sync to Machines (Safe Loop)
#     # 'eligible_machines' ONLY contains machines with the matching Level ID.
#     # Therefore, we ONLY send commands to the correct Serial Numbers.
#     for machine in eligible_machines:
#         # Double check device existence
#         if machine.biometric_device and machine.biometric_device.serial_number:
#             print(f"   ↳ Sending to Device SN: {machine.biometric_device.serial_number} (Level {machine.level})")
            
#             threading.Thread(
#                 target=task_provision_user, 
#                 args=(bio_user, machine.biometric_device, target_areas, et_dept_id)
#             ).start()


# ---------------------------------------------------
# SIGNAL 2: MASTER TABLE UPDATE
# ---------------------------------------------------
@receiver(post_save, sender=MasterTable)
def sync_attendance_devices(sender, instance, created, **kwargs):
    bio_user, _ = BioUser.objects.update_or_create(
        employeeid=instance.emp_id,
        defaults={'first_name': instance.first_name, 'last_name': instance.last_name or ""}
    )

    if created:
        client = EasyTimeClient()
        
        # A. Department: From MasterTable
        mt_dept_name = instance.department.department_name if instance.department else "General"
        et_dept_id = client.ensure_department(mt_dept_name)
        
        # B. Area: Default (Client logic defaults to Area 2/Factory)
        et_area_ids = None 

        # att_devices = BiometricDevice.objects.filter(is_attendance_device=True)
        # C. Find Targets: Attendance Devices OR Enrollment Devices
        # We want the new user on the Main Gate AND the Dojo Room Enrollment Device
        target_devices = BiometricDevice.objects.filter(
            Q(is_attendance_device=True) | Q(is_enrollment_device=True)
        )

        if target_devices.exists():
            print(f"--> Master Update: Syncing {bio_user.first_name} to {len(target_devices)} Base Devices (Attendance/Enrollment)")            
            for device in target_devices:
                threading.Thread(
                    target=task_provision_user, 
                    args=(bio_user, device, et_area_ids, et_dept_id)
                ).start()

# --- SIGNAL 3: DELETE FROM MASTER TABLE ---
@receiver(pre_delete, sender=MasterTable)
def delete_user_from_easytime_master(sender, instance, **kwargs):
    print(f"--> [MasterTable] Requesting delete for {instance.emp_id}...")
    client = EasyTimeClient()
    result = client.delete_employee(instance.emp_id)
    
    if result.get('status') == 'success':
        print("✅ Deleted Successfully from EasyTimePro")
    else:
        print(f"⚠️ Delete Warning: {result.get('message')}")

# --- SIGNAL 4: DELETE FROM BIOUSER (Frontend Action) ---
# @receiver(pre_delete, sender=BioUser)
# def delete_user_from_easytime_frontend(sender, instance, **kwargs):
#     if not MasterTable.objects.filter(emp_id=instance.employeeid).exists():
#         print(f"--> [Frontend] Deleting {instance.employeeid} from EasyTimePro...")
#         client = EasyTimeClient()
#         result = client.delete_employee(instance.employeeid)
        
#         if result.get('status') == 'success':
#             print(f"✅ API Success: User {instance.employeeid} deleted from EasyTimePro.")
#         else:
#             print(f"❌ API Failed: {result.get('message')}")
@receiver(pre_delete, sender=BioUser)
def delete_user_from_easytime_frontend(sender, instance, **kwargs):
    """
    When deleted from Frontend (BioUser), ALWAYS remove from EasyTimePro.
    We removed the MasterTable check so you can manually delete biometric access
    even if the employee remains in the HR MasterTable.
    """
    print(f"--> [Frontend] Deleting {instance.employeeid} from EasyTimePro...")
    
    client = EasyTimeClient()
    result = client.delete_employee(instance.employeeid)
    
    if result.get('status') == 'success':
        print(f"✅ API Success: User {instance.employeeid} deleted from EasyTimePro.")
    else:
        print(f"❌ API Failed: {result.get('message')}")

#---------numax easytimepro --------------------------------------

