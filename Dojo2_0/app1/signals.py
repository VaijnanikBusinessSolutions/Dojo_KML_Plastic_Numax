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
import requests
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import SkillMatrix, BioUser, Machine, BiometricEnrollment, MasterTable, BiometricDevice, Level
from .services.easytime_client import EasyTimeClient
from django.db.models import Q

# ---------------------------------------------------
# CONSOLIDATED BACKGROUND TASK (Prevents Race Conditions & Transaction Blocks)
# ---------------------------------------------------
def sync_user_profile_and_push_to_devices(bio_user, target_devices, target_areas, dept_name):
    """
    Updates/Creates the employee profile in EasyTimePro exactly ONCE.
    Then, triggers biometric sync pushes to target devices.
    Also handles dynamic device area detection (Fixes Attendance/Gate access).
    """
    client = EasyTimeClient()
    
    # 1. Resolve Department ID in EasyTimePro
    et_dept_id = client.ensure_department(dept_name)
    
    # 2. Gather All Dojo Area IDs
    dojo_target_areas = []
    
    # A. Enrollment Device Area (Dynamically detected to ensure Dojo Room access)
    try:
        enroll_dev_obj = BiometricDevice.objects.filter(is_enrollment_device=True).first()
        if enroll_dev_obj:
            headers = client.get_headers()
            term_data = requests.get(f"{client.terminals_list_url}?sn={enroll_dev_obj.serial_number}", headers=headers).json()
            if term_data.get('data') and len(term_data['data']) > 0:
                raw_area = term_data['data'][0].get('area')
                enroll_area_id = raw_area.get('id') if isinstance(raw_area, dict) else raw_area
                if enroll_area_id:
                    dojo_target_areas.append(enroll_area_id)
            else:
                dojo_target_areas.append(1)
        else:
            dojo_target_areas.append(1)
    except Exception as e:
        print(f"   ⚠️  Dynamic Area Lookup Failed: {e}")
        dojo_target_areas.append(1)
        
    # B. Add Skill Matrix Area IDs
    if target_areas:
        for aid in target_areas:
            if aid != 1 and aid not in dojo_target_areas:
                dojo_target_areas.append(aid)
                
    # C. Add Target Device Area IDs (Fixes Attendance Devices / Gate mismatch)
    for device in target_devices:
        try:
            headers = client.get_headers()
            res = requests.get(f"{client.terminals_list_url}?sn={device.serial_number}", headers=headers)
            if res.status_code == 200:
                data = res.json().get('data', [])
                if data:
                    raw_area = data[0].get('area')
                    dev_area_id = raw_area.get('id') if isinstance(raw_area, dict) else raw_area
                    if dev_area_id and dev_area_id not in dojo_target_areas:
                        dojo_target_areas.append(dev_area_id)
        except Exception as e:
            print(f"   ⚠️  Failed to fetch area for device {device.name}: {e}")

    # 3. Smart Merge: Fetch existing areas and filter out unqualified Dojo areas (Fixes Downgrade Revocation)
    existing_server_data = client.get_user_areas(bio_user.employeeid)
    existing_ids = []
    for item in existing_server_data:
        if isinstance(item, dict):
            if 'id' in item:
                existing_ids.append(item['id'])
        elif isinstance(item, int):
            existing_ids.append(item)
        elif isinstance(item, str) and item.isdigit():
             existing_ids.append(int(item))

    # Identify all Dojo-managed area IDs
    dojo_managed_ids = client.get_dojo_managed_area_ids()
    # Safely retain system default areas 1 and 2
    if 1 in dojo_managed_ids: dojo_managed_ids.remove(1)
    if 2 in dojo_managed_ids: dojo_managed_ids.remove(2)

    final_area_list = []
    # Retain non-Dojo areas and currently qualified Dojo areas
    for a_id in existing_ids:
        if (a_id not in dojo_managed_ids) or (a_id in dojo_target_areas):
            final_area_list.append(a_id)

    # Add new qualified Dojo areas
    for new_area in dojo_target_areas:
        if new_area not in final_area_list:
            final_area_list.append(new_area)

    # 4. Resolve Employee Demographics from MasterTable
    from django.apps import apps
    MasterTable_Model = apps.get_model('app1', 'MasterTable')
    try:
        mt = MasterTable_Model.objects.get(emp_id=bio_user.employeeid)
        mobile = mt.phone if (mt.phone and len(mt.phone) >= 10) else None
        gender = mt.sex
    except:
        mobile, gender = None, "M"
        
    pos_id = client.get_id_by_index('/personnel/api/positions/', index=0)
    
    payload = {
        "emp_code": bio_user.employeeid, 
        "first_name": bio_user.first_name, 
        "last_name": bio_user.last_name,
        "department": et_dept_id, 
        "position": pos_id, 
        "area": final_area_list,
        "mobile": mobile,
        "gender": gender,
        "app_status": 1
    }

    # 5. Single Sync Profile Write
    print(f"--> [EasyTime] Syncing profile {bio_user.employeeid} with Areas: {final_area_list}")
    client.create_employee_raw(payload)
    
    # 6. Fetch Internal User ID
    internal_uid = client.get_employee_internal_id(bio_user.employeeid)
    if not internal_uid:
        print(f"❌ User ID resolution failed for {bio_user.employeeid}")
        return
        
    sync_url = f"{client.base_url}/iclock/api/terminals/sync_data_to_device/"
    
    # 7. Push Biometric Templates to Devices in Parallel
    def push_sync(dev):
        # Prevent push if already enrolled (fixes duplicate check)
        if BiometricEnrollment.objects.filter(bio_user=bio_user, device=dev).exists():
            print(f"   ℹ️ User {bio_user.employeeid} already enrolled on {dev.name}. Skipping sync push.")
            return

        sync_payload = {
            "devices_sn": [dev.serial_number],
            "user_id": [str(internal_uid)], 
            "emp_code": True,
            "finger_print": True, 
            "face": True, 
            "vl_face": True 
        }
        try:
            res = requests.post(sync_url, json=sync_payload, headers=client.get_headers())
            if res.status_code in [200, 201]:
                BiometricEnrollment.objects.get_or_create(bio_user=bio_user, device=dev)
                print(f"   ✅ Synced {bio_user.first_name} to {dev.name} (Areas: {final_area_list}, Dept: {et_dept_id})")
            else:
                print(f"   ❌ Sync Failed for {dev.name}: {res.text}")
        except Exception as e:
            print(f"   ❌ Exception syncing to {dev.name}: {e}")
            
    for device in target_devices:
        if device.serial_number:
            threading.Thread(target=push_sync, args=(device,)).start()

    # 8. Clean up local enrollment logs for devices user no longer qualifies for
    BiometricEnrollment.objects.filter(bio_user=bio_user).exclude(device__in=target_devices).delete()


# ---------------------------------------------------
# SIGNAL 1: SKILL MATRIX SAVE
# ---------------------------------------------------
@receiver(post_save, sender=SkillMatrix)
def skill_matrix_biometric_trigger(sender, instance, **kwargs):
    if not instance.hierarchy or not instance.hierarchy.station:
        print(f"⚠️ SkillMatrix {instance.id} has no Station linked. Skipping.")
        return

    try:
        target_level_id = instance.level.level_id 
    except AttributeError:
        print(f"⚠️ SkillMatrix {instance.id} has invalid Level relation.")
        return

    # Find machines of same station with level <= operator's certified level
    eligible_machines = Machine.objects.filter(
        process=instance.hierarchy.station,
        level__lte=target_level_id,
        biometric_device__isnull=False
    ).select_related('biometric_device')

    if not eligible_machines.exists():
        print(f"ℹ️ No biometric machines found for Station: {instance.hierarchy.station} @ Level ID: {target_level_id}")
        return

    try:
        emp_record = MasterTable.objects.get(emp_id=instance.emp_id)
        bio_user, _ = BioUser.objects.update_or_create(
            employeeid=instance.emp_id,
            defaults={'first_name': emp_record.first_name, 'last_name': emp_record.last_name or ""}
        )
    except MasterTable.DoesNotExist:
        print(f"⚠️ Employee {instance.emp_id} not found in MasterTable.")
        return

    client = EasyTimeClient()
    dept_name = emp_record.department.department_name if emp_record.department else "General"

    # Compile qualified Dojo areas
    all_user_skills = SkillMatrix.objects.filter(emp_id=instance.emp_id)
    
    # Build target devices list
    target_devices = []
    for machine in eligible_machines:
        if machine.biometric_device not in target_devices:
            target_devices.append(machine.biometric_device)

    # We also sync them to default attendance/enrollment devices
    base_devices = BiometricDevice.objects.filter(
        Q(is_attendance_device=True) | Q(is_enrollment_device=True)
    )
    for dev in base_devices:
        if dev not in target_devices:
            target_devices.append(dev)

    # Run the entire sync in a single background thread to prevent blocks & races
    def background_skill_sync():
        compiled_areas = []
        for skill in all_user_skills:
            if skill.hierarchy and skill.hierarchy.station:
                user_skill_level_id = skill.level.level_id
                qualifying_levels = Level.objects.filter(level_id__lte=user_skill_level_id)
                st_name = skill.hierarchy.station.station_name
                st_id = skill.hierarchy.station.station_id
                for lvl in qualifying_levels:
                    s_name = f"{st_name}(S{st_id})-L{lvl.level_name}"
                    a_id = client.ensure_area(s_name)
                    if a_id not in compiled_areas:
                        compiled_areas.append(a_id)
        
        sync_user_profile_and_push_to_devices(bio_user, target_devices, compiled_areas, dept_name)

    threading.Thread(target=background_skill_sync).start()


# ---------------------------------------------------
# SIGNAL 1B: SKILL MATRIX DELETE
# ---------------------------------------------------
@receiver(pre_delete, sender=SkillMatrix)
def skill_matrix_delete_biometric_trigger(sender, instance, **kwargs):
    """
    When a SkillMatrix entry is deleted, recalculate operator's valid areas
    and remove access to machines they no longer qualify for.
    """
    try:
        emp_record = MasterTable.objects.get(emp_id=instance.emp_id)
        bio_user = BioUser.objects.filter(employeeid=instance.emp_id).first()
        if not bio_user:
            return
    except MasterTable.DoesNotExist:
        return

    client = EasyTimeClient()
    dept_name = emp_record.department.department_name if emp_record.department else "General"

    # Area Logic: Accumulate from remaining Skills (exclude current one)
    remaining_skills = SkillMatrix.objects.filter(emp_id=instance.emp_id).exclude(id=instance.id)
    
    target_devices = []
    # Fetch base devices
    base_devices = BiometricDevice.objects.filter(
        Q(is_attendance_device=True) | Q(is_enrollment_device=True)
    )
    for dev in base_devices:
        target_devices.append(dev)

    for skill in remaining_skills:
        if skill.hierarchy and skill.hierarchy.station:
            eligible_machines = Machine.objects.filter(
                process=skill.hierarchy.station,
                level__lte=skill.level.level_id,
                biometric_device__isnull=False
            ).select_related('biometric_device')
            for m in eligible_machines:
                if m.biometric_device not in target_devices:
                    target_devices.append(m.biometric_device)

    def background_delete_sync():
        compiled_areas = []
        for skill in remaining_skills:
            if skill.hierarchy and skill.hierarchy.station:
                user_skill_level_id = skill.level.level_id
                qualifying_levels = Level.objects.filter(level_id__lte=user_skill_level_id)
                st_name = skill.hierarchy.station.station_name
                st_id = skill.hierarchy.station.station_id
                for lvl in qualifying_levels:
                    s_name = f"{st_name}(S{st_id})-L{lvl.level_name}"
                    a_id = client.ensure_area(s_name)
                    if a_id not in compiled_areas:
                        compiled_areas.append(a_id)

        sync_user_profile_and_push_to_devices(bio_user, target_devices, compiled_areas, dept_name)

    threading.Thread(target=background_delete_sync).start()


# ---------------------------------------------------
# SIGNAL 2: MASTER TABLE SAVE
# ---------------------------------------------------
@receiver(post_save, sender=MasterTable)
def sync_attendance_devices(sender, instance, created, **kwargs):
    bio_user, _ = BioUser.objects.update_or_create(
        employeeid=instance.emp_id,
        defaults={'first_name': instance.first_name, 'last_name': instance.last_name or ""}
    )

    if created:
        mt_dept_name = instance.department.department_name if instance.department else "General"
        target_devices = BiometricDevice.objects.filter(
            Q(is_attendance_device=True) | Q(is_enrollment_device=True)
        )

        if target_devices.exists():
            print(f"--> Master Update: Syncing {bio_user.first_name} to {len(target_devices)} Base Devices (Attendance/Enrollment)")            
            # Run in background to prevent race conditions and transaction block
            threading.Thread(
                target=sync_user_profile_and_push_to_devices, 
                args=(bio_user, list(target_devices), None, mt_dept_name)
            ).start()


# ---------------------------------------------------
# SIGNAL 3: DELETE FROM MASTER TABLE
# ---------------------------------------------------
@receiver(pre_delete, sender=MasterTable)
def delete_user_from_easytime_master(sender, instance, **kwargs):
    print(f"--> [MasterTable] Requesting delete for {instance.emp_id}...")
    client = EasyTimeClient()
    result = client.delete_employee(instance.emp_id)
    
    if result.get('status') == 'success':
        print("✅ Deleted Successfully from EasyTimePro")
    else:
        print(f"⚠️ Delete Warning: {result.get('message')}")


# ---------------------------------------------------
# SIGNAL 4: DELETE FROM BIOUSER
# ---------------------------------------------------
@receiver(pre_delete, sender=BioUser)
def delete_user_from_easytime_frontend(sender, instance, **kwargs):
    """
    When deleted from Frontend (BioUser), ALWAYS remove from EasyTimePro.
    """
    print(f"--> [Frontend] Deleting {instance.employeeid} from EasyTimePro...")
    client = EasyTimeClient()
    result = client.delete_employee(instance.employeeid)
    
    if result.get('status') == 'success':
        print(f"✅ API Success: User {instance.employeeid} deleted from EasyTimePro.")
    else:
        print(f"❌ API Failed: {result.get('message')}")

#---------numax easytimepro End--------------------------------------
