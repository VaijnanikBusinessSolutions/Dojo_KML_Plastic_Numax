import datetime
from django.db import models
import os

# Create your models here.
import re
import pandas as pd
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.validators import RegexValidator
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from rest_framework_simplejwt.tokens import RefreshToken


# ------------------ Role Model ------------------




# ------------------ Management Commands Helper ------------------
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from rest_framework_simplejwt.tokens import RefreshToken


# ------------------ Role Model ------------------
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.name

    @classmethod
    def get_default_roles(cls):
        """Ensure required default roles exist"""
        default_roles = ['developer', 'management', 'admin', 'instructor', 'operator']
        for role_name in default_roles:
            cls.objects.get_or_create(name=role_name)


# ------------------ Custom User Manager ------------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, employeeid, first_name, last_name, role, factory, department, hq = None , password=None):
        if not email:
            raise ValueError("Users must have an email address")

        # Handle role - can be Role instance, role name, or role ID
        if isinstance(role, str):
            role_obj, _ = Role.objects.get_or_create(name=role)
        elif isinstance(role, int):
            role_obj = Role.objects.get(id=role)
        else:
            role_obj = role

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            employeeid=employeeid,
            first_name=first_name,
            last_name=last_name,
            role=role_obj,
            hq=hq,
            factory=factory,
            department=department,
            is_active=True
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, employeeid, first_name, last_name, hq, factory, department, password=None):
        # Ensure admin role exists
        admin_role, _ = Role.objects.get_or_create(name='admin')

        user = self.create_user(
            email=email,
            employeeid=employeeid,
            first_name=first_name,
            last_name=last_name,
            role=admin_role,  # always use admin role for superuser
            hq=hq,
            factory=factory,
            department=department,
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user



# ------------------ Custom User Model ------------------
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    employeeid = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='users')

    hq = models.CharField(max_length=50, blank=True, null=True)
    factory = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=50, blank=True, null=True)

    status = models.BooleanField(default=True)

    # Required Django Fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['employeeid', 'first_name', 'last_name', 'hq', 'factory', 'department']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }

    @property
    def role_name(self):
        return self.role.name if self.role else None


# ------------------ Management Commands Helper ------------------
class RoleManager:
    """Helper class to manage roles programmatically"""

    @staticmethod
    def create_roles(custom_roles):
        """
        Create roles dynamically (e.g., per company requirement).
        custom_roles = ['team_lead', 'plant_manager']
        """
        created_roles = []
        for role_name in custom_roles:
            role, created = Role.objects.get_or_create(name=role_name)
            if created:
                created_roles.append(role)
        return created_roles

    @staticmethod
    def get_roles_for_dropdown():
        """Get roles formatted for dropdown/choice fields"""
        roles = Role.objects.filter(is_active=True)
        return [(role.name, role.name) for role in roles]



#models.py

from django.db import models
# ------------------ HQ ------------------
class Hq(models.Model):
    hq_id = models.AutoField(primary_key=True)
    hq_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.hq_name

    class Meta:
        db_table = 'hq'


# ------------------ Factory ------------------
class Factory(models.Model):
    factory_id = models.AutoField(primary_key=True)
    factory_name = models.CharField(max_length=100)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='factories', null=True, blank=True)

    def __str__(self):
        return f"{self.factory_name} ({self.hq.hq_name if self.hq else 'No HQ'})"

    class Meta:
        db_table = 'factory'
        unique_together = ('factory_name', 'hq')


# ------------------ Department ------------------
class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=100)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='departments', null=True, blank=True)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='departments', null=True, blank=True)


    def __str__(self):
        if self.factory:
            return f"{self.department_name} ({self.factory.factory_name})"
        elif self.hq:
            return f"{self.department_name} ({self.hq.hq_name})"
        return self.department_name

    class Meta:
        db_table = 'department'


# ------------------ Line ------------------
class Line(models.Model):
    line_id = models.AutoField(primary_key=True)
    line_name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='lines', null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='lines', null=True, blank=True)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='lines', null=True, blank=True)


    def __str__(self):
        if self.department:
            return f"{self.line_name} ({self.department.department_name})"
        elif self.factory:
            return f"{self.line_name} ({self.factory.factory_name})"
        elif self.hq:
            return f"{self.line_name} ({self.hq.hq_name})"
        return self.line_name

    class Meta:
        db_table = 'line'


# ------------------ SubLine ------------------
class SubLine(models.Model):
    subline_id = models.AutoField(primary_key=True)
    subline_name = models.CharField(max_length=100)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='sublines', null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='sublines', null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='sublines', null=True, blank=True)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='sublines', null=True, blank=True)

    def __str__(self):
        if self.line:
            return f"{self.subline_name} ({self.line.line_name})"
        elif self.department:
            return f"{self.subline_name} ({self.department.department_name})"
        elif self.factory:
            return f"{self.subline_name} ({self.factory.factory_name})"
        elif self.hq:
            return f"{self.subline_name} ({self.hq.hq_name})"
        return self.subline_name

    class Meta:
        db_table = 'subline'


# ------------------ Station ------------------
class Station(models.Model):
    station_id = models.AutoField(primary_key=True)
    station_name = models.CharField(max_length=100)
    subline = models.ForeignKey(SubLine, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)

    def __str__(self):
        if self.subline:
            return f"{self.station_name} ({self.subline.subline_name})"
        elif self.line:
            return f"{self.station_name} ({self.line.line_name})"
        elif self.department:
            return f"{self.station_name} ({self.department.department_name})"
        elif self.factory:
            return f"{self.station_name} ({self.factory.factory_name})"
        elif self.hq:
            return f"{self.station_name} ({self.hq.hq_name})"
        return self.station_name

    class Meta:
        db_table = 'station'

        # Add this new model to your existing models.py

class HierarchyStructure(models.Model):
    structure_id = models.AutoField(primary_key=True)
    structure_name = models.CharField(max_length=200)

    # link to HQ and Factory
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='hierarchy_structures', null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='hierarchy_structures', null=True, blank=True)

    # instead of JSON, store direct relations
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="hierarchy_structures", null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name="hierarchy_structures", null=True, blank=True)
    subline = models.ForeignKey(SubLine, on_delete=models.CASCADE, related_name="hierarchy_structures", null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="hierarchy_structures", null=True, blank=True)

    def __str__(self):
        return f"{self.structure_name}-{self.department.department_name}-{self.station.station_name}"

    class Meta:
        db_table = "hierarchy_structure"
        
        
from django.db import models
from django.core.validators import RegexValidator

class MasterTable(models.Model):
    # Choices for sex/gender
    MALE = 'M'
    FEMALE = 'F'
    OTHER = 'O'
    SEX_CHOICES = [
        (MALE, 'Male'),
        (FEMALE, 'Female'),
        (OTHER, 'Other'),
    ]

    emp_id = models.CharField(max_length=20, primary_key=True, unique=True)  # Unique Employee ID
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    department = models.ForeignKey(
        'Department',
        on_delete=models.SET_NULL,
        null=True,
        related_name='employees'
    )
    current_line = models.ForeignKey(
        'Line',  # Link to your Line model
        on_delete=models.SET_NULL, # If Line is deleted, set this field to NULL
        null=True,                # Allow this field to be empty in the database
        blank=True,               # Allow this field to be blank in forms
        related_name='employees_on_line' # Optional, but good practice
    )
    current_station = models.ForeignKey(
        'Station', # Link to your Station model
        on_delete=models.SET_NULL, # If Station is deleted, set this field to NULL
        null=True,                # Allow this field to be empty in the database
        blank=True,               # Allow this field to be blank in forms
        related_name='employees_at_station' # Optional, but good practice
    )
    date_of_joining = models.DateField()
    designation = models.CharField(max_length=100, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)  # ✅ Birth date added
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, null=True, blank=True)
    email = models.EmailField(unique=False, null=True, blank=True)
    phone = models.CharField(
        null=True, blank=True,
        max_length=15,
        unique=False,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
        )]
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.emp_id})"


# ------------------ Level 0 ------------------    

from django.db import transaction   # ← This line was missing!
from django.utils import timezone
class TrainingBatch(models.Model):
    """ Manages the state of a training batch. """
    batch_id = models.CharField(max_length=20, unique=True, primary_key=True, help_text="e.g., BATCH-21-11-2025-1")
    is_active = models.BooleanField(default=True, help_text="Active batches appear in the attendance dropdown.")
    created_at = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.batch_id




# =================== VALIDATORS ============================




name_validator = RegexValidator(
    regex=r'^[A-Za-z]+(?: [A-Za-z]+){0,2}$',
    message='Name must contain only letters and up to two spaces (no numbers or special characters).'
)

def phone_number_validator(value):
    # Allow optional '+' followed by 10–15 digits
    pattern = re.compile(r'^\+?\d{10,15}$')
    if not pattern.match(value):
        raise ValidationError('Enter a valid phone number (10–15 digits, may start with +).')

    # Reject repeated same digits (e.g. 0000000000, 1111111111, etc.)
    if len(set(value.replace('+', ''))) == 1:
        raise ValidationError('Phone number cannot have all digits the same.')



def aadhar_validator(value):
    # Remove all spaces before validation
    clean_value = value.replace(" ", "")
    
    # Must be exactly 12 digits
    if not re.match(r'^\d{12}$', clean_value):
        raise ValidationError('Aadhaar number must be exactly 12 digits (spaces allowed).')
    
    # Reject all-same digits like 000000000000 or 111111111111
    if len(set(clean_value)) == 1:
        raise ValidationError('Aadhaar number cannot have all digits the same.')




class UserRegistration(models.Model):
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ('contractual', 'Contractual'),
        ('permanent', 'Permanent'),
    ]


    first_name = models.CharField(max_length=50, null=True, blank=True, validators=[name_validator])
    last_name = models.CharField(max_length=50, null=True, blank=True, validators=[name_validator])
    temp_id = models.CharField(max_length=50, unique=True, editable=False, blank=True, null=True)
    batch_id = models.CharField(max_length=20, editable=False, null=True, blank=True )
    email = models.EmailField(unique=False, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, default='M')
    photo = models.ImageField(upload_to='user_images/', null=True, blank=True)
    
    
    aadhar_number = models.CharField(max_length=12, null=True, blank=True, help_text="12-digit Aadhar number", validators=[aadhar_validator])
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, null=True, blank=True)
    experience = models.BooleanField(default=False, help_text="Check if you have work experience")
    experience_years = models.PositiveIntegerField(null=True, blank=True, help_text="Number of years of experience")
    company_of_experience = models.CharField(max_length=200, null=True, blank=True, help_text="Previous company name")


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    is_added_to_master = models.BooleanField(default=False)
    added_to_master_at = models.DateTimeField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)


    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.temp_id})"

    def save(self, *args, **kwargs):
        if not self.temp_id:
            self.temp_id = f"TEMP{uuid.uuid4().hex[:12].upper()}"

        if not self.pk:  # assign batch only for new user
            today = timezone.localdate()
            date_str = today.strftime("%d-%m-%Y")

            # Check if today's batch already exists
            today_batch = TrainingBatch.objects.filter(
                batch_id__startswith=f"BATCH-{date_str}-"
            ).first()

            if today_batch:
                # Use today's existing batch
                self.batch_id = today_batch.batch_id

            else:
                # Find the last used batch number across all days
                last_batch = TrainingBatch.objects.order_by('-batch_id').first()

                if last_batch:
                    last_num = int(last_batch.batch_id.split('-')[-1])
                    next_num = last_num + 1
                else:
                    next_num = 1

                # Create new batch for today
                new_batch_id = f"BATCH-{date_str}-{next_num}"
                self.batch_id = new_batch_id

                TrainingBatch.objects.create(
                    batch_id=new_batch_id,
                    is_active=True
                )

        super().save(*args, **kwargs)

    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        if self.experience:
            if not self.experience_years:
                raise ValidationError({'experience_years': 'Experience years is required when experience is selected.'})
            if not self.company_of_experience:
                raise ValidationError({'company_of_experience': 'Company of experience is required when experience is selected.'})
        
        # Validate Aadhar number format if provided
        if self.aadhar_number and len(self.aadhar_number) != 12:
            raise ValidationError({'aadhar_number': 'Aadhar number must be exactly 12 digits.'})


class HumanBodyQuestions(models.Model):
    question_text = models.TextField(unique=True)
    
    
    class Meta:
        ordering = ['id']

    def _str_(self):
        # return f"Q{self.order}: {self.question_text[:50]}..."
        return f"{self.question_text[:50]}..."


class HumanBodyCheckSession(models.Model):
    temp_id = models.CharField(max_length=50)  
    user = models.ForeignKey(UserRegistration, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        # Auto-populate user if not set
        if not self.user and self.temp_id:
            try:
                self.user = UserRegistration.objects.get(temp_id=self.temp_id)
            except UserRegistration.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Session for {self.temp_id} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

    @property
    def overall_status(self):
        answers = self.sheet_answers.values_list('answer', flat=True)
        if not answers:
            return 'pending'
        if 'fail' in answers:
            return 'fail'
        if all(ans == 'pass' for ans in answers):
            return 'pass'
        return 'pending'


class HumanBodyCheckSheet(models.Model):
    STATUS_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('pending', 'Pending'),
    ]
    
    session = models.ForeignKey(HumanBodyCheckSession, on_delete=models.CASCADE, related_name="sheet_answers")
    question = models.ForeignKey(HumanBodyQuestions, on_delete=models.CASCADE)
    answer = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    class Meta:
        unique_together = ('session', 'question')

    def __str__(self):
        return f"{self.session.temp_id} - {self.question.question_text[:30]} - {self.answer}"
    

# ------------------ Level 1 ------------------
class Level(models.Model):
    level_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    level_name = models.CharField(max_length=100, unique=True)
    

    def __str__(self):
        return f"{self.level_name}"


class Days(models.Model):
    days_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="days")
    day = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return f"Day {self.day} - {self.level.level_name}"
    
    class Meta:
        verbose_name_plural = "Days"  # Proper plural form


class SubTopic(models.Model):
    subtopic_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    subtopic_name = models.CharField(max_length=255)
    days = models.ForeignKey(Days, on_delete=models.CASCADE, related_name="subtopics")
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="topics")
    

    def __str__(self):
        return self.subtopic_name



class SubTopicContent(models.Model):
    subtopiccontent_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    subtopic = models.ForeignKey(SubTopic, on_delete=models.CASCADE, related_name="contents")
    content = models.TextField()

    def __str__(self):
        return f"Content for {self.subtopic.subtopic_name}"


class TrainingContent(models.Model):
    trainingcontent_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    subtopiccontent = models.ForeignKey(SubTopicContent, on_delete=models.CASCADE, related_name="training_contents")
    description = models.CharField(max_length=255, null=True, blank= True)
    training_file = models.FileField(upload_to="training_files/", blank=True, null=True)
    url_link = models.URLField(blank=True, null=True)
    material = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Training for {self.subtopiccontent.subtopic.subtopic_name}"


from django.db import models
from django.utils import timezone


class RescheduledSession(models.Model):
    """
    Stores rescheduled training sessions for employees who were absent.
    """
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        'UserRegistration', 
        on_delete=models.CASCADE, 
        related_name='rescheduled_sessions'
    )
    batch = models.ForeignKey(
        'TrainingBatch', 
        on_delete=models.CASCADE, 
        related_name='rescheduled_sessions'
    )
    original_day = models.ForeignKey(
        'Days', 
        on_delete=models.CASCADE, 
        related_name='original_absences',
        help_text="The day the employee was originally absent"
    )
    original_date = models.DateField(
        help_text="The original date when employee was absent"
    )
    
    # Rescheduled details
    rescheduled_date = models.DateField()
    rescheduled_time = models.TimeField()
    training_subtopic = models.ForeignKey(
        'SubTopic',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rescheduled_sessions'
    )
    training_name = models.CharField(
        max_length=255,
        help_text="Name of the training session"
    )
    notes = models.TextField(blank=True, null=True)
    
    # Status tracking
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='scheduled'
    )
    
    # Attendance for rescheduled session
    attendance_marked = models.BooleanField(default=False)
    attendance_status = models.CharField(
        max_length=10,
        choices=[('present', 'Present'), ('absent', 'Absent')],
        null=True,
        blank=True
    )
    attendance_marked_at = models.DateTimeField(null=True, blank=True)
    marked_by = models.CharField(max_length=100, null=True, blank=True)
    attendance_photo = models.ImageField(
    upload_to='rescheduled_attendance_photos/',
    null=True,
    blank=True,
    help_text="Photo taken when marking attendance for rescheduled session"
)
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rescheduled_date', '-rescheduled_time']
        verbose_name = 'Rescheduled Session'
        verbose_name_plural = 'Rescheduled Sessions'
    
    def __str__(self):
        return f"{self.employee.first_name} - {self.training_name} on {self.rescheduled_date}"
    
    def mark_attendance(self, status, marked_by=None):
        """Helper method to mark attendance for this session"""
        self.attendance_marked = True
        self.attendance_status = status
        self.attendance_marked_at = timezone.now()
        self.marked_by = marked_by
        if status == 'present':
            self.status = 'completed'
        self.save()
        

# =========================================end attendance ========================================


class Evaluation(models.Model):
    evaluation_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    subtopic = models.ForeignKey(SubTopic, on_delete=models.CASCADE, related_name="evaluations")
    evaluation_text = models.TextField()

    def __str__(self):
        return f"Evaluation for {self.subtopic.subtopic_name}"



class ProductionPlan(models.Model):
    month = models.CharField(max_length=20)
    year = models.PositiveIntegerField()

    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, null=True, blank=True)
    subline = models.ForeignKey(SubLine, on_delete=models.CASCADE, null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, null=True, blank=True)

    total_production_plan = models.PositiveIntegerField()
    total_production_actual = models.PositiveIntegerField(default=0)

    total_operators_required_plan = models.PositiveIntegerField(default=0)
    total_operators_required_actual = models.PositiveIntegerField(default=0)

    # CTQ Plan & Actual
    ctq_plan_l1 = models.PositiveIntegerField(default=0)
    ctq_plan_l2 = models.PositiveIntegerField(default=0)
    ctq_plan_l3 = models.PositiveIntegerField(default=0)
    ctq_plan_l4 = models.PositiveIntegerField(default=0)
    ctq_plan_total = models.PositiveIntegerField(default=0)

    ctq_actual_l1 = models.PositiveIntegerField(default=0)
    ctq_actual_l2 = models.PositiveIntegerField(default=0)
    ctq_actual_l3 = models.PositiveIntegerField(default=0)
    ctq_actual_l4 = models.PositiveIntegerField(default=0)
    ctq_actual_total = models.PositiveIntegerField(default=0)

    # PDI Plan & Actual
    pdi_plan_l1 = models.PositiveIntegerField(default=0)
    pdi_plan_l2 = models.PositiveIntegerField(default=0)
    pdi_plan_l3 = models.PositiveIntegerField(default=0)
    pdi_plan_l4 = models.PositiveIntegerField(default=0)
    pdi_plan_total = models.PositiveIntegerField(default=0)

    pdi_actual_l1 = models.PositiveIntegerField(default=0)
    pdi_actual_l2 = models.PositiveIntegerField(default=0)
    pdi_actual_l3 = models.PositiveIntegerField(default=0)
    pdi_actual_l4 = models.PositiveIntegerField(default=0)
    pdi_actual_total = models.PositiveIntegerField(default=0)

    # OTHER Plan & Actual
    other_plan_l1 = models.PositiveIntegerField(default=0)
    other_plan_l2 = models.PositiveIntegerField(default=0)
    other_plan_l3 = models.PositiveIntegerField(default=0)
    other_plan_l4 = models.PositiveIntegerField(default=0)
    other_plan_total = models.PositiveIntegerField(default=0)

    other_actual_l1 = models.PositiveIntegerField(default=0)
    other_actual_l2 = models.PositiveIntegerField(default=0)
    other_actual_l3 = models.PositiveIntegerField(default=0)
    other_actual_l4 = models.PositiveIntegerField(default=0)
    other_actual_total = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        location = f"{self.hq} > {self.factory}"
        if self.department:
            location += f" > {self.department}"
        if self.line:
            location += f" > {self.line}"
        if self.subline:
            location += f" > {self.subline}"
        if self.station:
            location += f" > {self.station}"
        return f"{self.month} {self.year} - {location}"


class QuestionPaper(models.Model):
    question_paper_id = models.AutoField(primary_key=True)
    question_paper_name = models.CharField(max_length=200)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="question_papers", null=True, blank=True
    )
    line = models.ForeignKey(
        Line, on_delete=models.CASCADE, related_name="question_papers", null=True, blank=True
    )
    subline = models.ForeignKey(
        SubLine, on_delete=models.CASCADE, related_name="question_papers", null=True, blank=True
    )
    station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="question_papers", null=True, blank=True
    )
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="question_papers")
    file = models.FileField(upload_to="question_papers/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question_paper_name
    

from django.db import models


class StationLevelQuestionPaper(models.Model):
    """Mapping: Assign one QuestionPaper to one Station at one Level under a Department → Line → Subline"""

    department = models.ForeignKey(
        "Department", on_delete=models.CASCADE, related_name="department_questionpapers",null=True, blank=True
    )
    line = models.ForeignKey(
        "Line", on_delete=models.CASCADE, related_name="line_questionpapers",null=True, blank=True
    )
    subline = models.ForeignKey(
        "Subline", on_delete=models.CASCADE, related_name="subline_questionpapers",null=True, blank=True
    )
    station = models.ForeignKey(
        "Station", on_delete=models.CASCADE, related_name="station_questionpapers",null=True, blank=True
    )
    level = models.ForeignKey(
        "Level", on_delete=models.CASCADE, related_name="level_questionpapers"
    )
    question_paper = models.ForeignKey(
        "QuestionPaper", on_delete=models.CASCADE, related_name="assigned_stations"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together = ("department", "line", "subline", "station", "level")
        verbose_name = "Station-Level Question Paper Mapping"
        verbose_name_plural = "Station-Level Question Paper Mappings"

    def __str__(self):
        return f"{self.department or ''} / {self.line or ''} / {self.subline or ''} / {self.station or ''} / {self.level} → {self.question_paper}"


    # def __str__(self):
    #     return f"{self.department} / {self.line} / {self.subline} / {self.station} / {self.level} → {self.question_paper}"

# from django.db import models
# from django.core.exceptions import ValidationError


# class TemplateQuestion(models.Model):
#     question_paper = models.ForeignKey(
#         "QuestionPaper", 
#         on_delete=models.CASCADE, 
#         related_name="template_questions"
#     )
#     question = models.TextField()
#     option_a = models.CharField(max_length=255)
#     option_b = models.CharField(max_length=255)
#     option_c = models.CharField(max_length=255)
#     option_d = models.CharField(max_length=255)
#     correct_answer = models.CharField(max_length=255)

#     def __str__(self):
#         return self.question[:50]  # show first 50 chars

#     def clean(self):
#         if self.correct_answer not in [
#             self.option_a, self.option_b, self.option_c, self.option_d
#         ]:
#             raise ValidationError("Correct answer must match one of the options.")




from django.db import models
from django.core.exceptions import ValidationError
import os


class TemplateQuestion(models.Model):
    question_paper = models.ForeignKey(
        "QuestionPaper", 
        on_delete=models.CASCADE, 
        related_name="template_questions"
    )
    question = models.TextField()
    option_a = models.CharField(max_length=255, blank=True, null=True)
    option_a_image = models.ImageField(upload_to='question_images/', blank=True, null=True)
    option_b = models.CharField(max_length=255, blank=True, null=True)
    option_b_image = models.ImageField(upload_to='question_images/', blank=True, null=True)
    option_c = models.CharField(max_length=255, blank=True, null=True)
    option_c_image = models.ImageField(upload_to='question_images/', blank=True, null=True)
    option_d = models.CharField(max_length=255, blank=True, null=True)
    option_d_image = models.ImageField(upload_to='question_images/', blank=True, null=True)
    correct_answer = models.CharField(max_length=255, blank=True, null=True)
    question_image = models.ImageField(upload_to='question_images/', blank=True, null=True)

    def __str__(self):
        return self.question[:50]

    def clean(self):
        # Check if correct_answer matches one of the text options or is empty (for image-only questions)
        text_options = [self.option_a, self.option_b, self.option_c, self.option_d]
        if self.correct_answer and self.correct_answer not in text_options:
            raise ValidationError("Correct answer must match one of the text options.")
        
        # Validate that at least one option has content (text or image)
        if not (self.option_a or self.option_a_image) and not (self.option_b or self.option_b_image) and \
           not (self.option_c or self.option_c_image) and not (self.option_d or self.option_d_image):
            raise ValidationError("At least one option must have text or an image.")









# ------------------ AR/VR ------------------
from django.db import models

class ARVRTrainingContent(models.Model):
    description = models.TextField()
    arvr_file = models.FileField(upload_to='arvr_files/', blank=True, null=True)
    url_link = models.TextField(max_length=500, blank=True, null=True)
    def str(self):
        return f"AR/VR Content - {self.description[:30]}..."


# --------------------------
# Level 2 Process Dojo
# --------------------------

from django.db import models

# class LevelWiseTrainingContent(models.Model):
#     level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="training_contents")
#     station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="training_contents")
#     content_name = models.CharField(max_length=200)
#     file = models.FileField(upload_to="training_files/", null=True, blank=True)
#     url = models.URLField(null=True, blank=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def _str_(self):
#         return f"{self.content_name} ({self.level.level_name} - {self.station.station_name})"
    



#=============== hanchou and shokuchou ================#




class HanContent(models.Model):
    title = models.CharField(max_length=100, default='')

    def _str_(self):
        return self.title


# --- NEW MODEL ---
# This is the "Subtopic" that will live under a HanContent.
class HanSubtopic(models.Model):
    title = models.CharField(max_length=150)
    # This links each subtopic to its parent main topic.
    han_content = models.ForeignKey(HanContent, on_delete=models.CASCADE, related_name='subtopics')

    def __str__(self):
        # e.g., "Introduction to Python -> Week 1: Variables"
        return f"{self.han_content.title} -> {self.title}"



class HanTrainingContent(models.Model):
    # This ForeignKey has been CHANGED to point to HanSubtopic.
    han_subtopic = models.ForeignKey(HanSubtopic, on_delete=models.CASCADE, related_name='materials',  null=True)
    description = models.TextField()
    training_file = models.FileField(upload_to='training_files/', blank=True, null=True)
    url_link = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"Material for {self.han_subtopic.title}"
    

    
class ShoContent(models.Model):
    title = models.CharField(max_length=100, default='')

    def _str_(self):
        return self.title



class ShoSubtopic(models.Model):
    title = models.CharField(max_length=150)
    # This links each subtopic to its parent main topic.
    sho_content = models.ForeignKey(ShoContent, on_delete=models.CASCADE, related_name='sho_subtopics')

    def __str__(self):
        # e.g., "Introduction to Python -> Week 1: Variables"
        return f"{self.sho_content.title} -> {self.title}"



class ShoTrainingContent(models.Model):
    sho_subtopic = models.ForeignKey(ShoSubtopic, on_delete=models.CASCADE, related_name='sho_materials',  null=True)
    sho_description = models.TextField()
    training_file = models.FileField(upload_to='training_files/', blank=True, null=True)
    url_link = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"Material for {self.sho_subtopic.title}"




from django.db import models
from django.core.exceptions import ValidationError

class HanchouExamQuestion(models.Model):
    question = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=255)

    def __str__(self):
        return self.question[:50]  # show first 50 chars

    def clean(self):
        if self.correct_answer not in [
            self.option_a, self.option_b, self.option_c, self.option_d
        ]:
            raise ValidationError("Correct answer must match one of the options.")

from django.db.models import F, Q

class HanchouExamResult(models.Model):
    employee = models.ForeignKey(MasterTable, on_delete=models.PROTECT, related_name="hanchou_results")
    exam_name = models.CharField(max_length=50, default="hanchou", editable=False)
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField()
    total_questions = models.PositiveIntegerField()
    score = models.PositiveIntegerField()
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    pass_mark_percent = models.PositiveSmallIntegerField(default=70)
    passed = models.BooleanField(default=False)
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(check=Q(score__lte=F("total_questions")),
                                   name="score_lte_total_questions"),
        ]

    @property
    def percentage(self):
        return 0 if not self.total_questions else round((self.score / self.total_questions) * 100, 2)

    def save(self, *args, **kwargs):
        self.passed = self.percentage >= self.pass_mark_percent
        super().save(*args, **kwargs)


from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q



class ShokuchouExamQuestion(models.Model):
    sho_question = models.TextField()
    sho_option_a = models.CharField(max_length=255)
    sho_option_b = models.CharField(max_length=255)
    sho_option_c = models.CharField(max_length=255)
    sho_option_d = models.CharField(max_length=255)
    sho_correct_answer = models.CharField(max_length=255)

    def __str__(self):
        return self.sho_question[:50]  # show first 50 chars

    def clean(self):
        if self.sho_correct_answer not in [
            self.sho_option_a,
            self.sho_option_b,
            self.sho_option_c,
            self.sho_option_d,
        ]:
            raise ValidationError("Correct answer must match one of the options.")


class ShokuchouExamResult(models.Model):
    employee = models.ForeignKey(
        MasterTable, on_delete=models.PROTECT, related_name="shokuchou_results"
    )
    sho_exam_name = models.CharField(max_length=50, default="shokuchou", editable=False)
    sho_started_at = models.DateTimeField()
    sho_submitted_at = models.DateTimeField()
    sho_total_questions = models.PositiveIntegerField()
    sho_score = models.PositiveIntegerField()
    sho_duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    sho_pass_mark_percent = models.PositiveSmallIntegerField(default=70)
    sho_passed = models.BooleanField(default=False)
    sho_remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(sho_score__lte=F("sho_total_questions")),
                name="sho_score_lte_total_questions",
            ),
        ]

    @property
    def sho_percentage(self):
        return (
            0
            if not self.sho_total_questions
            else round((self.sho_score / self.sho_total_questions) * 100, 2)
        )

    def save(self, *args, **kwargs):
        self.sho_passed = self.sho_percentage >= self.sho_pass_mark_percent
        super().save(*args, **kwargs)


#=============== Hanchou and Shokuchou END ================#


    
# ================= 10 cycle ==============================#

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .models import MasterTable, Department, Station, Level

class TenCycleDayConfiguration(models.Model):
    id = models.AutoField(primary_key=True)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='day_configurations')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='day_configurations')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='day_configurations', null=True, blank=True)
    day_name = models.CharField(max_length=50)  # e.g., "Day 1"
    sequence_order = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('level', 'department', 'station', 'day_name')
        ordering = ['level', 'department', 'station', 'sequence_order']

    def __str__(self):
        return f"{self.level.level_name} - {self.department.department_name} - {self.day_name}"

class TenCycleTopics(models.Model):
    id = models.AutoField(primary_key=True)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='tencycle_topics')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='tencycle_topics')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='ten_cycle_topics', null=True, blank=True)
    slno = models.PositiveIntegerField()
    cycle_topics = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('level', 'department', 'station', 'slno')
        ordering = ['level', 'department', 'station', 'slno']

    def __str__(self):
        return f"{self.level.level_name} - {self.cycle_topics}"

class TenCycleSubTopic(models.Model):
    id = models.AutoField(primary_key=True)
    topic = models.ForeignKey(TenCycleTopics, on_delete=models.CASCADE, related_name='subtopics')
    sub_topic = models.CharField(max_length=200)
    score_required = models.PositiveIntegerField(default=1)  
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('topic', 'sub_topic')
        ordering = ['topic', 'id']

    def __str__(self):
        return f"{self.topic.cycle_topics} - {self.sub_topic}"

class TenCyclePassingCriteria(models.Model):
    id = models.AutoField(primary_key=True)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='ten_cycle_passing_criteria')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='ten_cycle_passing_criteria')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='ten_cycle_passing_criteria', null=True, blank=True)
    passing_percentage = models.FloatField(
        default=60.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Minimum percentage required to pass"
    )
    created_by = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('level', 'department', 'station')

    def __str__(self):
        return f"{self.level.level_name} - {self.department.department_name} ({self.passing_percentage}%)"

# class OperatorPerformanceEvaluation(models.Model):
#     id = models.AutoField(primary_key=True)
#     employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name='performance_evaluations')
#     date = models.DateField()
#     shift = models.CharField(max_length=20,null=True, blank=True)
#     department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='evaluations')
#     station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='evaluations')
#     level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='evaluations')
#     line = models.CharField(max_length=100, null=True,blank=True)
#     # process_name = models.CharField(max_length=100,null)
#     operation_no = models.CharField(max_length=50,null=True,blank=True)
#     date_of_retraining_completed = models.DateField(null=True, blank=True)
#     prepared_by = models.CharField(max_length=100, null=True, blank=True)
#     checked_by = models.CharField(max_length=100, null=True, blank=True)
#     approved_by = models.CharField(max_length=100, null=True, blank=True)
#     is_completed = models.BooleanField(default=False)
#     final_percentage = models.FloatField(null=True, blank=True)
#     final_status = models.CharField(max_length=30, choices=[
#         ('Pass', 'Pass'),
#         ('Fail - Retraining Required', 'Fail - Retraining Required'),
#         ('Not Evaluated', 'Not Evaluated')
#     ], default='Not Evaluated')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.employee.emp_id}"




class OperatorPerformanceEvaluation(models.Model):
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name='performance_evaluations')
    date = models.DateField()
    shift = models.CharField(max_length=20,null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='evaluations')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='evaluations')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='evaluations')
    line = models.CharField(max_length=100, null=True,blank=True)
    # process_name = models.CharField(max_length=100,null)
    operation_no = models.CharField(max_length=50,null=True,blank=True)
    date_of_retraining_completed = models.DateField(null=True, blank=True)
    prepared_by = models.CharField(max_length=100, null=True, blank=True)
    checked_by = models.CharField(max_length=100, null=True, blank=True)
    approved_by = models.CharField(max_length=100, null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    final_percentage = models.FloatField(null=True, blank=True)
    final_status = models.CharField(max_length=30, choices=[
        ('Pass', 'Pass'),
        ('Fail', 'Fail'),
        ('Not Evaluated', 'Not Evaluated')
    ], default='Not Evaluated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    attempt_no = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.employee.emp_id}"












class EvaluationSubTopicMarks(models.Model):
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(OperatorPerformanceEvaluation, on_delete=models.CASCADE, related_name='subtopic_marks')
    subtopic = models.ForeignKey(TenCycleSubTopic, on_delete=models.CASCADE, related_name='subtopic_marks')
    day = models.ForeignKey(TenCycleDayConfiguration, on_delete=models.CASCADE, related_name='subtopic_marks')
    
    # Marks for each day/cycle
    mark_1 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_2 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_3 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_4 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_5 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_6 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_7 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_8 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_9 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_10 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])

    total_score = models.IntegerField(null=True, blank=True)
    max_possible_score = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('employee', 'subtopic', 'day')

    def save(self, *args, **kwargs):
        marks = [
            self.mark_1, self.mark_2, self.mark_3, self.mark_4, self.mark_5,
            self.mark_6, self.mark_7, self.mark_8, self.mark_9, self.mark_10
        ]

        # Validate marks don't exceed subtopic's score_required
        for mark in marks:
            if mark is not None and mark > self.subtopic.score_required:
                raise ValueError(f"Mark {mark} exceeds maximum allowed score {self.subtopic.score_required}")

        valid_marks = [mark for mark in marks if mark is not None]
        self.total_score = sum(valid_marks) if valid_marks else 0
        self.max_possible_score = 10 * self.subtopic.score_required

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.subtopic.topic.cycle_topics} - {self.subtopic.sub_topic} - {self.day.day_name}"
    



class TenCycleDailyMetrics(models.Model):
    id = models.AutoField(primary_key=True)
    evaluation = models.ForeignKey(OperatorPerformanceEvaluation, on_delete=models.CASCADE, related_name="daily_metrics")
    day = models.ForeignKey(TenCycleDayConfiguration, on_delete=models.CASCADE, related_name="daily_metrics")

    cycle_time_required = models.FloatField(null=True, blank=True)
    cycle_time_actual_1 = models.FloatField(null=True, blank=True)
    cycle_time_actual_2 = models.FloatField(null=True, blank=True)
    cycle_time_actual_3 = models.FloatField(null=True, blank=True)
    cycle_time_actual_4 = models.FloatField(null=True, blank=True)
    cycle_time_actual_5 = models.FloatField(null=True, blank=True)
    cycle_time_actual_6 = models.FloatField(null=True, blank=True)
    cycle_time_actual_7 = models.FloatField(null=True, blank=True)
    cycle_time_actual_8 = models.FloatField(null=True, blank=True)
    cycle_time_actual_9 = models.FloatField(null=True, blank=True)
    cycle_time_actual_10 = models.FloatField(null=True, blank=True)

    quality_rate = models.FloatField(null=True, blank=True)   # %
    productivity = models.FloatField(null=True, blank=True)   # %

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('evaluation', 'day')
 


from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=EvaluationSubTopicMarks)
def update_operator_evaluation_summary(sender, instance, **kwargs):
    evaluation = instance.employee  # OperatorPerformanceEvaluation instance

    # --- Debugging Logs Start ---
    print("\n--- DEBUG: Operator Evaluation Update ---")
    print(f"Evaluation ID: {evaluation.id}")

    # --- Get config days ---
    days = TenCycleDayConfiguration.objects.filter(
        level=evaluation.level,
        department=evaluation.department,
        station=evaluation.station,
        is_active=True
    ).order_by("id")
    # Add fallback logic print here if you suspect configuration issues
    if not days.exists() and evaluation.station:
        days = TenCycleDayConfiguration.objects.filter(
            level=evaluation.level,
            department=evaluation.department,
            station__isnull=True,
            is_active=True
        ).order_by("id")
    day_ids = list(days.values_list("id", flat=True))
    print(f"1. Configured Day IDs: {day_ids}")

    # --- Get config subtopics (WITH FALLBACK) ---
    topics = TenCycleTopics.objects.filter(
        level=evaluation.level,
        department=evaluation.department,
        station=evaluation.station,
        is_active=True
    )

    # 💥 ADD THE FALLBACK HERE 💥
    if not topics.exists():
        topics = TenCycleTopics.objects.filter(
            level=evaluation.level,
            department=evaluation.department,
            station__isnull=True, # Look for department-level topics
            is_active=True
        )
    # If topics are still empty, subtopic_ids will be an empty list (0 count).
    subtopic_ids = list(
        TenCycleSubTopic.objects.filter(
            topic__in=topics,
            is_active=True
        ).values_list("id", flat=True)
    )

    print(f"2. Active Subtopic Count: {len(subtopic_ids)}")

    # --- Completeness Check (The core of your "Not Evaluated" issue) ---
    expected_count = len(day_ids) * len(subtopic_ids)
    actual_count = EvaluationSubTopicMarks.objects.filter(
        employee=evaluation,
        day_id__in=day_ids,
        subtopic_id__in=subtopic_ids
    ).count()

    print(f"3. Expected Marks Count (Days * Subtopics): {expected_count}")
    print(f"4. Actual Marks Count (DB Records): {actual_count}")
    is_complete = (expected_count > 0) and (actual_count == expected_count)
    print(f"5. Is Complete? {is_complete}")

    # --- Calculate percentage per day ---
    day_scores = {}
    for day_id in day_ids:
        marks = EvaluationSubTopicMarks.objects.filter(
            employee=evaluation,
            day_id=day_id,
            subtopic_id__in=subtopic_ids
        )
        total_score = sum(m.total_score or 0 for m in marks)
        total_max = sum(m.max_possible_score or 0 for m in marks)
        percentage = (total_score / total_max) * 100 if total_max > 0 else 0.0
        day_scores[day_id] = round(percentage, 2)

    # --- Passing percentage (default 70) ---
    try:
      criteria = TenCyclePassingCriteria.objects.get(
        level=evaluation.level,
        department=evaluation.department,
        station=evaluation.station,
        is_active=True
      )
      passing_percentage = criteria.passing_percentage
    except TenCyclePassingCriteria.DoesNotExist:
      passing_percentage = 70.0

    # --- Check criteria for last 3 days ---
    final_status = "Fail"
    if len(day_ids) >= 3:
      last_three_ids = day_ids[-3:]  # always last 3 days  Day 5, Day 6, Day 7 IDs
    #   last_day_id = day_ids[-1]      # last day (e.g. Day 6)

    # *** FIX: Target the SECOND-TO-LAST Day for Metrics ***
      # last_day_id = day_ids[-1]  <-- OLD (checks Day 7)
      
      # Target the second-to-last day (Day 6) in a 7-day sequence
      metrics_check_day_id = day_ids[-2] if len(day_ids) >= 2 else None

      # check scores for last 3 days
      if all(day_scores.get(did, 0) >= passing_percentage for did in last_three_ids):
        # # extra criteria for last day (quality & productivity)
        # last_day_metrics = evaluation.daily_metrics.filter(day_id=last_day_id).first()
        # if last_day_metrics and last_day_metrics.quality_rate and last_day_metrics.productivity:
        #     if last_day_metrics.quality_rate > 98 and last_day_metrics.productivity == 100:
        #         final_status = "Pass"

        # extra criteria for Day 6 metrics
        final_status_is_pass = False
        if metrics_check_day_id is not None:
            last_day_metrics = evaluation.daily_metrics.filter(day_id=metrics_check_day_id).first()
            if last_day_metrics and last_day_metrics.quality_rate and last_day_metrics.productivity:
                if last_day_metrics.quality_rate > 98 and last_day_metrics.productivity == 100:
                    final_status_is_pass = True
        
        if final_status_is_pass:
            final_status = "Pass"

    # --- Completeness check ---
    is_complete = (expected_count > 0) and (actual_count == expected_count)

    # --- Update evaluation ---
    overall_percentage = (
        sum(day_scores.values()) / len(day_scores) if day_scores else 0
    )
    evaluation.final_percentage = round(overall_percentage, 2)
    evaluation.final_status = final_status if is_complete else "Not Evaluated"
    evaluation.is_completed = is_complete
    print(f"6. FINAL Status to be saved: {evaluation.final_status}")
    evaluation.save(update_fields=["final_percentage", "final_status", "is_completed"])




# =========================== 10 cycle ============================ #


#OJT models


# ------------------ OJT Topic ------------------
# ------------------ OJT Topic ------------------
class OJTTopic(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="ojt_topics")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="ojt_topics")
    sl_no = models.PositiveIntegerField()
    topic = models.CharField(max_length=200)
    category = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.sl_no}. {self.topic} ({self.department.department_name} - {self.level.level_name})"


# ------------------ Trainee Info ------------------

# class TraineeInfo(models.Model):
#     trainee_name = models.CharField(max_length=100)
#     trainer_id = models.CharField(max_length=50)
#     emp_id = models.CharField(max_length=50, null=True, blank=True)
#     line = models.CharField(max_length=100)
#     subline = models.CharField(max_length=100)
#     station = models.ForeignKey('Station', on_delete=models.CASCADE, related_name='trainees')
#     process_name = models.CharField(max_length=100)
#     revision_date = models.DateField()
#     doj = models.DateField()
#     trainer_name = models.CharField(max_length=100)
#     status = models.CharField(max_length=50, default="Pending")
#     level = models.ForeignKey('Level', on_delete=models.CASCADE, related_name='trainees')

#     def __str__(self):
#         return f"{self.trainee_name} ({self.emp_id}) - Level {self.level.pk}"

#     class Meta:
#         unique_together = ('emp_id', 'station', 'level')  # Critical: one record per emp-station-level
#         verbose_name = "Trainee Info"
#         verbose_name_plural = "Trainee Info"



class TraineeInfo(models.Model):
    trainee_name = models.CharField(max_length=100)
    trainer_id = models.CharField(max_length=50)
    emp_id = models.CharField(max_length=50, null=True, blank=True)
    line = models.CharField(max_length=100)
    subline = models.CharField(max_length=100)
    station = models.ForeignKey('Station', on_delete=models.CASCADE, related_name='trainees')
    process_name = models.CharField(max_length=100)
    revision_date = models.DateField()
    doj = models.DateField()
    trainer_name = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default="Pending")
    level = models.ForeignKey('Level', on_delete=models.CASCADE, related_name='trainees')
    prepared_by = models.CharField(max_length=150, null=True, blank=True)
    approved_by = models.CharField(max_length=150, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    attempt_no = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.trainee_name} ({self.emp_id}) - Level {self.level.pk}"

    class Meta:
        indexes = [
            models.Index(fields=['emp_id', 'station', 'level']),
        ]
        verbose_name = "Trainee Info"
        verbose_name_plural = "Trainee Info"




# ------------------ OJT Days ------------------
class OJTDay(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="ojt_days")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="ojt_days")
    name = models.CharField(max_length=100)

    def str(self):
        return f"{self.name} ({self.department.department_name} - {self.level.level_name})"



class OJTScoreRange(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="score_ranges")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="score_ranges")
    min_score = models.PositiveIntegerField(default=0)
    max_score = models.PositiveIntegerField()

    class Meta:
        unique_together = ("department", "level")  # prevent duplicate ranges

    def str(self):
        return f"{self.department.department_name} - {self.level.level_name}: {self.min_score} to {self.max_score}"

from django.core.exceptions import ValidationError

class OJTScore(models.Model):
    topic = models.ForeignKey(OJTTopic, on_delete=models.CASCADE, related_name="scores")
    day = models.ForeignKey(OJTDay, on_delete=models.CASCADE, related_name="scores")
    trainee = models.ForeignKey(TraineeInfo, on_delete=models.CASCADE, related_name="scores")
    score = models.PositiveIntegerField()

    def clean(self):
        department = self.topic.department
        level = self.topic.level

        try:
            score_range = OJTScoreRange.objects.get(department=department, level=level)
        except OJTScoreRange.DoesNotExist:
            raise ValidationError({
                "score": f"No score range defined for {department.department_name} - {level.level_name}."
            })

        if not (score_range.min_score <= self.score <= score_range.max_score):
            raise ValidationError({
                "score": f"Score must be between {score_range.min_score} and {score_range.max_score} "
                         f"for {department.department_name} - {level.level_name}."
            })

    def save(self, *args, **kwargs):
        # Ensure validation runs on save (not only via forms)
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.trainee.trainee_name} - {self.topic.topic} - Day {self.day.name} : {self.score}"



# ------------------ OJT Score Criteria ------------------

class OJTPassingCriteria(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="ojt_passing_criteria")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="ojt_passing_criteria")
    day = models.ForeignKey("OJTDay", on_delete=models.CASCADE, null=True, blank=True, related_name="ojt_passing_criteria")
    # If day is NULL, it means criteria applies to ALL days in that dept+level
    percentage = models.FloatField(help_text="Passing percentage (e.g., 60 for 60%)")

    class Meta:
        unique_together = ("department", "level", "day")  # avoid duplicates

    def str(self):
        if self.day:
            return f"{self.department.department_name} - {self.level.level_name} - {self.day.name}: {self.percentage}%"
        return f"{self.department.department_name} - {self.level.level_name} (All Days): {self.percentage}%"
    
#-----------------------Quantity OJT ----------------------------#

from django.db import models


class QuantityOJTScoreRange(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="quantity_score_ranges",default="")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="quantity_score_ranges",default="")

    # Production Score Range
    production_min_score = models.DecimalField(max_digits=5, decimal_places=2)
    production_max_score = models.DecimalField(max_digits=5, decimal_places=2)

    # Rejection Score Range
    rejection_min_score = models.DecimalField(max_digits=5, decimal_places=2)
    rejection_max_score = models.DecimalField(max_digits=5, decimal_places=2)

    def _str_(self):
        return f"[{self.department.name} - {self.level.name}] Production: {self.production_min_score}-{self.production_max_score}, Rejection: {self.rejection_min_score}-{self.rejection_max_score}"



class QuantityPassingCriteria(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="quantity_passing_criteria",default="")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="quantity_passing_criteria",default="")

    production_passing_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    rejection_passing_percentage = models.DecimalField(max_digits=5, decimal_places=2)

    def _str_(self):
        return f"[{self.department.name} - {self.level.name}] Production Passing: {self.production_passing_percentage}%, Rejection Passing: {self.rejection_passing_percentage}%"


class OJTLevel2Quantity(models.Model):
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="ojt_records")
    trainee_name = models.CharField(max_length=200)
    trainee_id = models.CharField(max_length=50, unique=True)
    emp_id = models.CharField(max_length=50, blank=True, null=True)
    station = models.ForeignKey("Station", on_delete=models.CASCADE, related_name='quantity_trainees', null=True, blank=True)
    line_name = models.CharField(max_length=100,null=True, blank=True)
    process_name = models.CharField(max_length=200,null=True, blank=True)
    revision_date = models.DateField()
    doj = models.DateField(verbose_name="Date of Joining")
    trainer_name = models.CharField(max_length=200)
    engineer_judge = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=50, default="Pending")

    def _str_(self):
        return f"{self.trainee_name} ({self.trainee_id})"

    @property
    def production_total(self):
        """Sum of production marks across all evaluations"""
        return sum(e.production_marks for e in self.evaluations.all())

    @property
    def rejection_total(self):
        """Sum of rejection marks across all evaluations"""
        return sum(e.rejection_marks for e in self.evaluations.all())

    def evaluate_status(self):
        """Check trainee Pass/Fail based on passing criteria"""
        criteria = QuantityPassingCriteria.objects.filter(
            level=self.level
        ).first()

        if not criteria:
            return  # No criteria defined

        days = self.evaluations.count()

        # Max possible scores (from setup)
        prod_max_rule = QuantityScoreSetup.objects.filter(
            level=self.level,
            score_type="production"
        ).order_by("-marks").first()

        rej_max_rule = QuantityScoreSetup.objects.filter(
            level=self.level,
            score_type="rejection"
        ).order_by("-marks").first()

        if not prod_max_rule or not rej_max_rule:
            return

        production_max_total = days * prod_max_rule.marks
        rejection_max_total = days * rej_max_rule.marks

        required_production = (criteria.production_passing_percentage / 100) * production_max_total
        required_rejection = (criteria.rejection_passing_percentage / 100) * rejection_max_total

        if self.production_total >= required_production and self.rejection_total >= required_rejection:
            self.status = "Pass"
        else:
            self.status = "Fail"

        self.save()



# ---------------------------
#   Daily Evaluation
# ---------------------------
class Level2QuantityOJTEvaluation(models.Model):
    ojt_record = models.ForeignKey(
        OJTLevel2Quantity,
        on_delete=models.CASCADE,
        related_name="evaluations"
    )
    day = models.PositiveIntegerField()
    date = models.DateField()
    plan = models.PositiveIntegerField()
    production_actual = models.PositiveIntegerField()
    production_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    rejection_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    number_of_rejections = models.PositiveIntegerField()

    def _str_(self):
        return f"Day {self.day} - {self.ojt_record.trainee_name} ({self.date})"

    @property
    def percentage(self):
        """% of production achieved against plan"""
        if self.plan > 0:
            return (self.production_actual / self.plan) * 100
        return 0

    def calculate_production_marks(self):
        pct = self.percentage
        rule = QuantityScoreSetup.objects.filter(
            score_type="production",
            min_value__lte=pct,
            max_value__gte=pct,
            level=self.ojt_record.level
        ).first()
        return rule.marks if rule else 0

    def calculate_rejection_marks(self):
        rejections = self.number_of_rejections
        rule = QuantityScoreSetup.objects.filter(
            score_type="rejection",
            min_value__lte=rejections,
            max_value__gte=rejections,
            level=self.ojt_record.level
        ).first()
        return rule.marks if rule else 0

    def save(self, *args, **kwargs):
        # Auto-calculate marks before saving
        self.production_marks = self.calculate_production_marks()
        self.rejection_marks = self.calculate_rejection_marks()
        super().save(*args, **kwargs)



# ==================== Refreshment Training ======================== #

class Training_category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Curriculum(models.Model):
    category = models.ForeignKey(
        Training_category, on_delete=models.CASCADE, related_name='topics')
    topic = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("category", "topic")
        ordering = ["topic"]

    def __str__(self):
        return f"{self.category.name} > {self.topic}"


class CurriculumContent(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('document', 'Document'),
        ('image', 'Image'),
        ('link', 'Link'),
    ]

    curriculum = models.ForeignKey(
        'Curriculum', on_delete=models.CASCADE, related_name='contents')
    content_name = models.CharField(max_length=200)
    content_type = models.CharField(
        max_length=10, choices=CONTENT_TYPE_CHOICES)

    file = models.FileField(
        upload_to='training_contents/', null=True, blank=True)
    link = models.URLField(null=True, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content_name


class Trainer_name(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Venues(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Schedule(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('pending', 'Pending'),
    ]

    training_category = models.ForeignKey(
        Training_category, on_delete=models.CASCADE, related_name='scheduled_categories')
    training_name = models.ForeignKey(
        Curriculum, on_delete=models.CASCADE, related_name='scheduled_topics')

    trainer = models.ForeignKey(
        Trainer_name, on_delete=models.SET_NULL, null=True)
    venue = models.ForeignKey(Venues, on_delete=models.SET_NULL, null=True)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    date = models.DateField()
    time = models.TimeField()

    employees = models.ManyToManyField(
        "MasterTable", related_name='schedules')

    def __str__(self):
        return f"{self.training_name.topic} on {self.date}"


class EmployeeAttendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('rescheduled', 'Rescheduled'),
    ]

    schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name='attendances')
    employee = models.ForeignKey(
        'MasterTable', on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='present')
    notes = models.TextField(blank=True, null=True)

    # For rescheduling
    reschedule_date = models.DateField(blank=True, null=True)
    reschedule_time = models.TimeField(blank=True, null=True)
    reschedule_reason = models.TextField(blank=True, null=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('schedule', 'employee')

    def __str__(self):
        return f"{self.employee} - {self.schedule} - {self.status}"


class RescheduleLog(models.Model):
    schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name='reschedule_logs')
    employee = models.ForeignKey(
        'MasterTable', on_delete=models.CASCADE, related_name='reschedule_logs')
    original_date = models.DateField()
    original_time = models.TimeField()
    new_date = models.DateField()
    new_time = models.TimeField()
    reason = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Reschedule for {self.employee} on {self.schedule}"
    
# ==================== Refreshment Training End ======================== #

class StationSetting(models.Model):
    SETTING_CHOICES = [
        ('CTQ', 'CTQ'),
        ('PDI', 'PDI'),
        ('OTHER', 'Other'),
        ('MARU A', 'Maru A'),
        ('CRITICAL', 'Critical'),
    ]

    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='settings')
    option = models.CharField(max_length=10, choices=SETTING_CHOICES)

    def _str_(self):
        return f"{self.station.station_name} ({self.department.department_name}) - {self.get_option_display()}"

    

class TestSession(models.Model):
    test_name = models.CharField(max_length=100)
    key_id = models.CharField(max_length=10, unique=True)
    employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE, db_index=True)
    level = models.ForeignKey('Level', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    skill = models.ForeignKey('Station', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    question_paper = models.ForeignKey('QuestionPaper', on_delete=models.CASCADE, related_name='test_sessions', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if self.employee and not self.department:
            self.department = self.employee.department
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.test_name} - {self.employee}"



from django.db.models import JSONField

# class Score(models.Model):
#     employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE)
#     marks = models.IntegerField()
#     test = models.ForeignKey('TestSession', on_delete=models.SET_NULL, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     percentage = models.FloatField(default=0)
#     passed = models.BooleanField(default=False)
#     department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
#     level = models.ForeignKey('Level', on_delete=models.SET_NULL, null=True, blank=True)
#     skill = models.ForeignKey('Station', on_delete=models.SET_NULL, null=True, blank=True)


#     raw_answers = JSONField(default=list, blank=True)

#     def save(self, *args, **kwargs):
#         # Auto-fill department from employee if not set
#         if self.employee and not self.department:
#             self.department = self.employee.department
#         # Auto-fill level and skill from test session if not set
#         if self.test:
#             if not self.level and self.test.level:
#                 self.level = self.test.level
#             if not self.skill and self.test.skill:
#                 self.skill = self.test.skill
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.employee} - {self.test} ({self.marks} marks)"





class Score(models.Model):
    employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE)
    marks = models.IntegerField()
    test = models.ForeignKey('TestSession', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    percentage = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
    level = models.ForeignKey('Level', on_delete=models.SET_NULL, null=True, blank=True)
    skill = models.ForeignKey('Station', on_delete=models.SET_NULL, null=True, blank=True)

    raw_answers = JSONField(default=list, blank=True)
    attempt_no = models.PositiveIntegerField(default=1)

    def save(self, *args, **kwargs):
        # Auto-fill department from employee if not set
        if self.employee and not self.department:
            self.department = self.employee.department
        # Auto-fill level and skill from test session if not set
        if self.test:
            if not self.level and self.test.level:
                self.level = self.test.level
            if not self.skill and self.test.skill:
                self.skill = self.test.skill
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee} - {self.test} ({self.marks} marks)"








# class TestSession(models.Model):
#     test_name = models.CharField(max_length=100)
#     key_id = models.CharField(max_length=10, unique=True)  # Ensures no duplicate keys
#     employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE, db_index=True)
#     level = models.ForeignKey('Level', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
#     skill = models.ForeignKey('Station', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
#     question_paper = models.ForeignKey( 'QuestionPaper', on_delete=models.CASCADE, related_name='test_sessions', null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
#     def save(self, *args, **kwargs):
#         if self.employee and not self.department:
#             self.department = self.employee.department  # auto-fill from employee
#         super().save(*args, **kwargs)
    

#     def __str__(self):
#         return f"{self.test_name} - {self.employee}"





# class Score(models.Model):
#     employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE)
#     marks = models.IntegerField()
#     test = models.ForeignKey('TestSession', on_delete=models.SET_NULL, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     percentage = models.FloatField(default=0)
#     passed = models.BooleanField(default=False)
#     department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
#     level = models.ForeignKey('Level', on_delete=models.SET_NULL, null=True, blank=True)
#     skill = models.ForeignKey('Station', on_delete=models.SET_NULL, null=True, blank=True)

#     def save(self, *args, **kwargs):
#         # This method correctly copies the department from the employee when a score is saved.
#         if self.employee:
#             if not self.department:
#                 self.department = self.employee.department
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.employee} - {self.test} ({self.marks} marks)"



#test part integration

from django.db import models

class KeyEvent(models.Model):
    base_id = models.IntegerField()
    key_id = models.IntegerField()
    key_sn = models.CharField(max_length=255, default='unknown')
    mode = models.IntegerField()
    timestamp = models.DateTimeField()
    info = models.CharField(max_length=255)
    client_timestamp = models.DateTimeField()
    event_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

class ConnectEvent(models.Model):
    base_id = models.IntegerField()
    mode = models.IntegerField()
    info = models.CharField(max_length=255)
    timestamp = models.DateTimeField()




class VoteEvent(models.Model):
    base_id = models.IntegerField()
    mode = models.IntegerField()
    info = models.CharField(max_length=255)
    timestamp = models.DateTimeField()



from django.db import models

class CompanyLogo(models.Model):
    name = models.CharField(max_length=100)  # Optional: Name of the logo (e.g., company name)
    logo = models.ImageField(upload_to='logos/',blank=True,null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def str(self):
        return self.name or f"Logo{self.id}"


# from django.db import models

# class EvaluationPassingCriteria(models.Model):
#     level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="passing_criteria")
#     department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="passing_criteria")
#     percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Required percentage (e.g., 75.00)")

#     class Meta:
#         unique_together = ("level", "department")  # Prevent duplicate criteria for same level & department
#         verbose_name_plural = "Evaluation Passing Criteria"

#     def __str__(self):
#         return f"{self.level.level_name} - {self.department.department_name}: {self.percentage}%"
    
# ==================== Retraining starts ======================== #

# ==================== Retraining starts ======================== #


# class RetrainingConfig(models.Model):
#     level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='retraining_configs')
#     evaluation_type = models.CharField(
#         max_length=20, 
#         choices=[
#             ('Evaluation', 'Evaluation'),
#             ('OJT', 'OJT'),
#             ('10 Cycle', '10 Cycle')
#         ]
#     )
#     max_count = models.PositiveIntegerField(default=2)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ('level', 'evaluation_type')

#     def _str_(self):
#         return f"{self.level.level_name} - {self.evaluation_type} (Max: {self.max_count})"




class RetrainingConfig(models.Model):
    # level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='retraining_configs')
    evaluation_type = models.CharField(
        max_length=20, 
        choices=[
            ('Evaluation', 'Evaluation'),
            ('OJT', 'OJT'),
            ('10 Cycle', '10 Cycle')
        ],
        unique=True
    )
    max_count = models.PositiveIntegerField(default=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"{self.evaluation_type} (Max: {self.max_count})"






# class RetrainingSession(models.Model):
#     employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name='retraining_sessions')
#     level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='retraining_sessions')
#     department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='retraining_sessions')
#     station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='retraining_sessions',null=True, blank=True)
#     evaluation_type = models.CharField(
#         max_length=20, 
#         choices=[
#             ('Evaluation', 'Evaluation'),
#             ('OJT', 'OJT'),
#             ('10 Cycle', '10 Cycle')
#         ]
#     )
#     scheduled_date = models.DateField()
#     scheduled_time = models.TimeField()
#     venue = models.CharField(max_length=128)
#     status = models.CharField(max_length=16, choices=[('Pending','Pending'),('Completed','Completed'),('Missed','Missed')], default='Pending')
#     attempt_no = models.PositiveIntegerField(default=1)
#     performance_percentage = models.FloatField(null=True, blank=True)
#     required_percentage = models.FloatField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['employee', 'evaluation_type', 'level', 'department', 'station', 'attempt_no']

#     def _str_(self):
#         return f"{self.employee.emp_id} - {self.level.level_name}/{self.department.department_name}/{self.station.station_name} - {self.evaluation_type} (Attempt {self.attempt_no})"




class RetrainingSession(models.Model):
    employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name='retraining_sessions')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='retraining_sessions')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='retraining_sessions')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='retraining_sessions',null=True, blank=True)
    evaluation_type = models.CharField(
        max_length=20, 
        choices=[
            ('Evaluation', 'Evaluation'),
            ('OJT', 'OJT'),
            ('10 Cycle', '10 Cycle')
        ]
    )
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    venue = models.CharField(max_length=128)
    status = models.CharField(max_length=16, choices=[('Pending','Pending'),
        ('Scheduled', 'Scheduled'),('Completed','Completed'),('Missed','Missed')], default='Pending')
    attempt_no = models.PositiveIntegerField(default=1)
    performance_percentage = models.FloatField(null=True, blank=True)
    required_percentage = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['employee', 'evaluation_type', 'level', 'department', 'station', 'attempt_no']

    def _str_(self):
        return f"{self.employee.emp_id} - {self.level.level_name}/{self.department.department_name}/{self.station.station_name} - {self.evaluation_type} (Attempt {self.attempt_no})"






class RetrainingSessionDetail(models.Model):
    """Detailed information for each retraining session"""
    retraining_session = models.OneToOneField(
        RetrainingSession, 
        on_delete=models.CASCADE, 
        related_name='session_detail'
    )
    
    observations_failure_points = models.TextField(blank=True, null=True)
    trainer_name = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Detail for {self.retraining_session}"

    class Meta:
        verbose_name = "Retraining Session Detail"


        
#-----------------------Quantity OJT ----------------------------#

from django.db import models


# ---------------------------
#  Rules for Marks (Image Setup)
# ---------------------------
class QuantityScoreSetup(models.Model):
    """Stores the scoring setup for Production % and Rejections"""
    TYPE_CHOICES = (
        ("production", "Production"),
        ("rejection", "Rejection"),
    )

    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="score_setups")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="score_setups")

    score_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    min_value = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    max_value = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    marks = models.PositiveIntegerField()

    def _str_(self):
        return f"[{self.department.name} - {self.level.name}] {self.get_score_type_display()} {self.min_value}-{self.max_value} → {self.marks}"


# ---------------------------
#  Passing Criteria
# ---------------------------
# class QuantityPassingCriteria(models.Model):
#     department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="quantity_passing_criteria")
#     level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="quantity_passing_criteria")

#     production_passing_percentage = models.DecimalField(max_digits=5, decimal_places=2)
#     rejection_passing_percentage = models.DecimalField(max_digits=5, decimal_places=2)

#     def _str_(self):
#         return f"[{self.department.name} - {self.level.name}] Production Passing: {self.production_passing_percentage}%, Rejection Passing: {self.rejection_passing_percentage}%"



from django.db import models

class AssessmentMode(models.Model):
    MODE_CHOICES = [
        ('quality', 'Quality-Based'),
        ('quantity', 'Quantity-Based'),
    ]
    
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='quality')
    updated_at = models.DateTimeField(auto_now=True)
    
    @classmethod
    def get_current_mode(cls):
        mode, created = cls.objects.get_or_create(id=1, defaults={'mode': 'quality'})
        return mode
    
from django.db.models.signals import post_save
from django.dispatch import receiver

class LevelColour(models.Model):
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="colours")
    colour_code = models.CharField(max_length=20)  # e.g., "#ef4444"

    class Meta:
        unique_together = ('level',) 

    def __str__(self):
        return f"{self.level.level_name} - {self.colour_code}"

DEFAULT_COLOURS = {
    1: "#ef4444",  # red - Level 1
    2: "#f59e0b",  # amber - Level 2
    3: "#3b82f6",  # blue - Level 3
    4: "#10b981",  # emerald - Level 4
}

@receiver(post_save, sender=Level)
def create_default_colour(sender, instance, created, **kwargs):
    """
    Automatically assign a default colour when a new Level is created.
    """
    if created:
        level_id = instance.level_id
        if level_id in DEFAULT_COLOURS:
            if not LevelColour.objects.filter(level=instance).exists():
                LevelColour.objects.create(
                    level=instance, 
                    colour_code=DEFAULT_COLOURS[level_id]
                )

class SkillMatrixDisplaySetting(models.Model):
    # singleton entry for global setting
    display_shape = models.CharField(max_length=20, choices=[('piechart', 'Pie Chart'), ('levelblock', 'Level Block')], default='piechart')

    def __str__(self):
        return f"Display Shape: {self.display_shape}"

    class Meta:
        verbose_name = "Skill Matrix Display Setting"
        verbose_name_plural = "Skill Matrix Display Settings"

class SkillMatrix(models.Model):
    employee = models.ForeignKey("MasterTable", on_delete=models.CASCADE, related_name="skills")
    employee_name = models.CharField(max_length=100)
    emp_id = models.CharField(max_length=50)
    doj = models.DateField()
    level = models.ForeignKey("Level", on_delete=models.CASCADE)
    # link to hierarchy instead of station directly
    hierarchy = models.ForeignKey("HierarchyStructure", on_delete=models.CASCADE, related_name="skill_matrices")
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"{self.employee_name} - {self.hierarchy.station.station_name if self.hierarchy.station else 'No Station'} (Level {self.level.level_name})"



from django.db import models
from django.utils import timezone

class Notification(models.Model):
    """
    Comprehensive notification model for real-time notifications
    Tracks all system events and user interactions
    """
    NOTIFICATION_TYPES = [
        ('employee_registration', 'Employee Registration'),
        ('level_exam_completed', 'Level Exam Completed'),
        ('training_added', 'Training Added'),
        ('training_updated', 'Training Updated'),
        ('training_scheduled', 'Training Scheduled'),
        ('training_completed', 'Training Completed'),
        ('training_reschedule', 'Training Reschedule'),
        ('refresher_training_scheduled', 'Refresher Training Scheduled'),
        ('refresher_training_completed', 'Refresher Training Completed'),
        ('hanchou_exam_completed', 'Hanchou Exam Completed'),
        ('shokuchou_exam_completed', 'Shokuchou Exam Completed'),
        ('ten_cycle_evaluation_completed', '10 Cycle Evaluation Completed'),
        ('ojt_completed', 'OJT Completed'),
        ('ojt_quantity_completed', 'OJT Quantity Completed'),
        ('machine_allocated', 'Machine Allocated'),
        ('test_assigned', 'Test Assigned'),
        ('evaluation_completed', 'Evaluation Completed'),
        ('retraining_scheduled', 'Retraining Scheduled'),
        ('retraining_completed', 'Retraining Completed'),
        ('human_body_check_completed', 'Human Body Check Completed'),
        ('milestone_reached', 'Milestone Reached'),
        ('system_alert', 'System Alert'),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)

    # Recipients
    recipient = models.ForeignKey('User', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    recipient_email = models.EmailField(null=True, blank=True)

    # Related objects
    employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    level = models.ForeignKey('Level', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    training_schedule = models.ForeignKey('Schedule', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    machine_allocation = models.ForeignKey('MachineAllocation', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    test_session = models.ForeignKey('TestSession', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    retraining_session = models.ForeignKey('RetrainingSession', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    human_body_check_session = models.ForeignKey('HumanBodyCheckSession', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')

    # Status tracking
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='medium')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient or self.recipient_email}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

    def mark_as_unread(self):
        """Mark notification as unread"""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            self.save(update_fields=['is_read', 'read_at'])

# In models.py

class HandoverSheet(models.Model):
    employee = models.OneToOneField(MasterTable, on_delete=models.CASCADE)  # ensures only one per employee
    industrial_experience = models.CharField(max_length=255, blank=True, null=True)
    kpapl_experience = models.CharField(max_length=255, blank=True, null=True)
    required_department_at_handover = models.CharField(max_length=255,  blank=True, null=True)
    distributed_department_after_dojo = models.ForeignKey(Department, on_delete=models.CASCADE)
    allocated_line = models.ForeignKey(
        'Line',  # Make sure you have a 'Line' model defined in this file
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="The specific line within the department the employee was allocated to during this handover."
    )

    allocated_station = models.ForeignKey(
        'Station',  # Make sure you have a 'Station' model defined in this file
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="The specific station the employee was allocated to during this handover."
    )
    handover_date = models.DateField( blank=True, null=True)
    contractor_name = models.CharField(max_length=255, blank=True, null=True)
    p_and_a_name = models.CharField(max_length=255,blank=True, null=True)
    qa_hod_name = models.CharField(max_length=255, blank=True, null=True)
    is_training_completed = models.BooleanField(default=False)
    gojo_incharge_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Handover for {self.employee.emp_id}"




class TrainingTopic(models.Model):
    topic_name = models.CharField(max_length=200)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="training_topics",default='')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="training_topics",default='')
    
    def __str__(self):
        return f"{self.topic_name} ({self.level.level_name} - {self.station.station_name})"



class LevelWiseTrainingContent(models.Model):
    topic = models.ForeignKey(
        TrainingTopic,
        on_delete=models.CASCADE,
        related_name="contents",
        null=True,          # optional
        blank=True          # optional
    )
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="training_contents")
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="training_contents")
    content_name = models.CharField(max_length=200)
    file = models.FileField(upload_to="training_files/", null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"{self.content_name} ({self.level.level_name} - {self.station.station_name})"
    



import uuid
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver








class DailyProductionData(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    entry_mode = models.CharField(
        max_length=10,
        choices=[('DAILY', 'Daily'), ('WEEKLY', 'Weekly'), ('MONTHLY', 'Monthly')],
        default='DAILY'
    )
    batch_id = models.UUIDField(default=uuid.uuid4, editable=False)

    Hq = models.ForeignKey(Hq, on_delete=models.CASCADE, null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, null=True, blank=True)
    subline = models.ForeignKey(SubLine, on_delete=models.CASCADE, null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, null=True, blank=True)

    
    total_production_plan = models.PositiveIntegerField(default=0)
    total_production_actual = models.PositiveIntegerField(default=0)
    
    
    total_operators_available = models.PositiveIntegerField(
        default=0,
        help_text="The total operators on payroll at the start of this period (Starting Team)"
    )
    total_operators_required_plan = models.PositiveIntegerField(default=0, help_text="Operators We NEED (Plan)")
    total_operators_required_actual = models.PositiveIntegerField(default=0)

    attrition_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, help_text="e.g., 2.0 for 2%")
    absenteeism_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, help_text="e.g., 5.5 for 5.5%")

   
    ctq_plan_l1 = models.PositiveIntegerField(default=0)
    ctq_plan_l2 = models.PositiveIntegerField(default=0)
    ctq_plan_l3 = models.PositiveIntegerField(default=0)
    ctq_plan_l4 = models.PositiveIntegerField(default=0)
    ctq_plan_total = models.PositiveIntegerField(default=0, editable=False)
    
    ctq_actual_l1 = models.PositiveIntegerField(default=0)
    ctq_actual_l2 = models.PositiveIntegerField(default=0)
    ctq_actual_l3 = models.PositiveIntegerField(default=0)
    ctq_actual_l4 = models.PositiveIntegerField(default=0)
    ctq_actual_total = models.PositiveIntegerField(default=0, editable=False)

    pdi_plan_l1 = models.PositiveIntegerField(default=0)
    pdi_plan_l2 = models.PositiveIntegerField(default=0)
    pdi_plan_l3 = models.PositiveIntegerField(default=0)
    pdi_plan_l4 = models.PositiveIntegerField(default=0)
    pdi_plan_total = models.PositiveIntegerField(default=0, editable=False)
    
    pdi_actual_l1 = models.PositiveIntegerField(default=0)
    pdi_actual_l2 = models.PositiveIntegerField(default=0)
    pdi_actual_l3 = models.PositiveIntegerField(default=0)
    pdi_actual_l4 = models.PositiveIntegerField(default=0)
    pdi_actual_total = models.PositiveIntegerField(default=0, editable=False)

    other_plan_l1 = models.PositiveIntegerField(default=0)
    other_plan_l2 = models.PositiveIntegerField(default=0)
    other_plan_l3 = models.PositiveIntegerField(default=0)
    other_plan_l4 = models.PositiveIntegerField(default=0)
    other_plan_total = models.PositiveIntegerField(default=0, editable=False)
    
    other_actual_l1 = models.PositiveIntegerField(default=0)
    other_actual_l2 = models.PositiveIntegerField(default=0)
    other_actual_l3 = models.PositiveIntegerField(default=0)
    other_actual_l4 = models.PositiveIntegerField(default=0)
    other_actual_total = models.PositiveIntegerField(default=0, editable=False)

    bifurcation_plan_l1 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_plan_l2 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_plan_l3 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_plan_l4 = models.PositiveIntegerField(default=0, editable=False)

    bifurcation_actual_l1 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_actual_l2 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_actual_l3 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_actual_l4 = models.PositiveIntegerField(default=0, editable=False)

    
    grand_total_plan = models.PositiveIntegerField(default=0, editable=False)
    grand_total_actual = models.PositiveIntegerField(default=0, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_date']

    def __str__(self):
        # Updated to show the new date range for clarity in Django Admin
        if self.start_date == self.end_date:
            return f"{self.start_date} (Daily) - {self.line.line_name if self.line else 'N/A'}"
        return f"{self.start_date} to {self.end_date} - {self.line.line_name if self.line else 'N/A'}"




@receiver(pre_save, sender=DailyProductionData)
def calculate_totals_on_save(sender, instance, **kwargs):
    """
    This function automatically calculates all production totals before saving.
    The complex operator gap logic is now handled in the view.
    """
    # 1. Calculate Department Totals
    instance.ctq_plan_total = instance.ctq_plan_l1 + instance.ctq_plan_l2 + instance.ctq_plan_l3 + instance.ctq_plan_l4
    instance.ctq_actual_total = instance.ctq_actual_l1 + instance.ctq_actual_l2 + instance.ctq_actual_l3 + instance.ctq_actual_l4
    instance.pdi_plan_total = instance.pdi_plan_l1 + instance.pdi_plan_l2 + instance.pdi_plan_l3 + instance.pdi_plan_l4
    instance.pdi_actual_total = instance.pdi_actual_l1 + instance.pdi_actual_l2 + instance.pdi_actual_l3 + instance.pdi_actual_l4
    instance.other_plan_total = instance.other_plan_l1 + instance.other_plan_l2 + instance.other_plan_l3 + instance.other_plan_l4
    instance.other_actual_total = instance.other_actual_l1 + instance.other_actual_l2 + instance.other_actual_l3 + instance.other_actual_l4

    # 2. Calculate Bifurcation Totals from department data
    instance.bifurcation_plan_l1 = instance.ctq_plan_l1 + instance.pdi_plan_l1 + instance.other_plan_l1
    instance.bifurcation_actual_l1 = instance.ctq_actual_l1 + instance.pdi_actual_l1 + instance.other_actual_l1
    instance.bifurcation_plan_l2 = instance.ctq_plan_l2 + instance.pdi_plan_l2 + instance.other_plan_l2
    instance.bifurcation_actual_l2 = instance.ctq_actual_l2 + instance.pdi_actual_l2 + instance.other_actual_l2
    instance.bifurcation_plan_l3 = instance.ctq_plan_l3 + instance.pdi_plan_l3 + instance.other_plan_l3
    instance.bifurcation_actual_l3 = instance.ctq_actual_l3 + instance.pdi_actual_l3 + instance.other_actual_l3
    instance.bifurcation_plan_l4 = instance.ctq_plan_l4 + instance.pdi_plan_l4 + instance.other_plan_l4
    instance.bifurcation_actual_l4 = instance.ctq_actual_l4 + instance.pdi_actual_l4 + instance.other_actual_l4

    # 3. Calculate Grand Totals
    instance.grand_total_plan = instance.ctq_plan_total + instance.pdi_plan_total + instance.other_plan_total
    instance.grand_total_actual = instance.ctq_actual_total + instance.pdi_actual_total + instance.other_actual_total




class AdvanceManpowerDashboard(models.Model):
    # Direct hierarchy relations
    hq = models.ForeignKey("Hq", on_delete=models.CASCADE, null=True, blank=True)
    factory = models.ForeignKey("Factory", on_delete=models.CASCADE)
    department = models.ForeignKey("Department", on_delete=models.CASCADE, null=True, blank=True)
    line = models.ForeignKey("Line", on_delete=models.CASCADE, null=True, blank=True)
    subline= models.ForeignKey("SubLine", on_delete=models.CASCADE, null=True, blank=True)
   
    station = models.ForeignKey("Station", on_delete=models.CASCADE, null=True, blank=True)

    # Time period
    month = models.PositiveSmallIntegerField()  # 1–12
    year = models.PositiveSmallIntegerField()

    # KPIs / Metrics
    total_stations = models.PositiveIntegerField(default=0)
    operators_required = models.PositiveIntegerField(default=0)
    operators_available = models.PositiveIntegerField(default=0)
    buffer_manpower_required = models.PositiveIntegerField(default=0)
    buffer_manpower_available = models.PositiveIntegerField(default=0)
    l1_required= models.PositiveIntegerField(default=0)
    l1_available= models.PositiveIntegerField(default=0)
    l2_required= models.PositiveIntegerField(default=0)
    l2_available= models.PositiveIntegerField(default=0)
    l3_required= models.PositiveIntegerField(default=0)
    l3_available= models.PositiveIntegerField(default=0)
    l4_required= models.PositiveIntegerField(default=0)
    l4_available= models.PositiveIntegerField(default=0)


    attrition_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)   # %
    absenteeism_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
     # %

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "advance_manpower_dashboard"
        unique_together = ("hq", "factory", "department", "line", "subline", "station", "month", "year")

    def __str__(self):
        return f"{self.factory} - {self.month}/{self.year}"





class ManagementReview(models.Model):

    hq = models.ForeignKey("Hq", on_delete=models.CASCADE, null=True, blank=True)
    factory = models.ForeignKey("Factory", on_delete=models.CASCADE)
    department = models.ForeignKey("Department", on_delete=models.CASCADE, null=True, blank=True)
    line = models.ForeignKey("Line", on_delete=models.CASCADE, null=True, blank=True)
    subline = models.ForeignKey("Subline", on_delete=models.CASCADE, null=True, blank=True)
    station = models.ForeignKey("Station", on_delete=models.CASCADE, null=True, blank=True)


    # Time period
    month = models.PositiveSmallIntegerField()  # 1–12
    year = models.PositiveSmallIntegerField()

    new_operators_joined = models.IntegerField()
    new_operators_trained = models.IntegerField()
    total_training_plans = models.IntegerField()
    total_trainings_actual = models.IntegerField()
    total_defects_msil = models.IntegerField()
    ctq_defects_msil = models.IntegerField()
    total_defects_tier1 = models.IntegerField()
    ctq_defects_tier1 = models.IntegerField()
    total_internal_rejection = models.IntegerField()
    ctq_internal_rejection = models.IntegerField()
    manpower_available = models.IntegerField(null=True)
    manpower_required = models.IntegerField(null=True)
    gca_defects = models.DecimalField(
        max_digits=5,   # total digits (e.g., 100.00 = 5 digits)
        decimal_places=2,  # digits after the decimal point
        null=True
    )

    unique_together = (
            "hq", "factory", "department", "line", "subline", "station", "month", "year"
        )
    def __str__(self):
        return f"{self.factory} - {self.month}/{self.year}"





class UserManualdocs(models.Model):
    name = models.CharField(max_length=255, help_text="Content name/title")
    file = models.FileField(
        upload_to='usermanual_docs/', 
        help_text="Upload document file"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Content"
        verbose_name_plural = "Contents"

    def __str__(self):
        return self.name

    @property
    def file_extension(self):
        """Get file extension if file exists"""
        if self.file:
            return os.path.splitext(self.file.name)[1].lower()
        return None

    @property
    def file_size(self):
        """Get file size in bytes if file exists"""
        if self.file:
            try:
                return self.file.size
            except (OSError, ValueError):
                return 0
        return 0

    def delete(self, *args, **kwargs):
        """Override delete to also remove the file from storage"""
        if self.file:
            # Delete the file from storage when the model instance is deleted
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)

class EvaluationPassingCriteria(models.Model):
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="passing_criteria")
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="passing_criteria")
    percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Required percentage (e.g., 75.00)")

    class Meta:
        unique_together = ("level", "department")  # Prevent duplicate criteria for same level & department
        verbose_name_plural = "Evaluation Passing Criteria"

    def __str__(self):
        return f"{self.level.level_name} - {self.department.department_name}: {self.percentage}%"


# ==================== TrainingBatch ======================== #
    

class TrainingAttendance(models.Model):
    """ Stores daily attendance for each user in a batch. """
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
    ]
    
    user = models.ForeignKey(UserRegistration, on_delete=models.CASCADE, related_name='attendances')
    batch = models.ForeignKey(TrainingBatch, on_delete=models.CASCADE, related_name='attendances', to_field='batch_id')
    day_number = models.ForeignKey(Days, on_delete=models.CASCADE, related_name='day_attendances')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    
    # --- NEW FIELD ---
    # This field will store the actual calendar date the attendance was marked on.
    attendance_date = models.DateField(help_text="The calendar date this attendance was recorded" ,null=True, blank= True)
    
    date_marked = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['batch', 'user', 'day_number']
        # A user can only have one attendance status per day in a given batch.
        unique_together = ('user', 'batch', 'day_number')

    def _str_(self):
        return f"{self.user.first_name} - {self.batch.batch_id} - Day {self.day_number}: {self.status}"

    

# ==================== TrainingBatch End ======================== #
 
from django.db import models
from django.utils.timezone import now

class MultiSkilling(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    employee = models.ForeignKey("MasterTable", on_delete=models.CASCADE, related_name="multi_skills")
    emp_id = models.CharField(max_length=20, blank=True)
    employee_name = models.CharField(max_length=100, blank=True)
    date_of_joining = models.DateField(null=True, blank=True)
    department_name = models.CharField(max_length=100, blank=True, null=True) 

    department = models.ForeignKey(Department, on_delete=models.CASCADE,null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE,null=True, blank=True)
    # hierarchy = models.ForeignKey("HierarchyStructure", on_delete=models.CASCADE, related_name="multi_skills")

    skill_level =  models.ForeignKey(Level, on_delete=models.CASCADE)
    start_date = models.DateField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.employee:
            self.emp_id = self.employee.emp_id
            self.employee_name = f"{self.employee.first_name} {self.employee.last_name}"
            self.date_of_joining = self.employee.date_of_joining
            self.department_name = (
                self.employee.department.department_name if self.employee.department else None
            )
        super().save(*args, **kwargs)

    @property
    def current_status(self):
        today = now().date()
        if self.status == "scheduled" and self.start_date and self.start_date <= today:
            return "in-progress"
        return self.status

    def __str__(self):
        return f"{self.employee_name} - {self.station.station_name if self.station else 'No Station'}"


 # ==================== MultiSkilling End ======================== #

 
 # ==================== Biometric Manmachine Interlinkage setup  =================== # 

# Numax easytimepro satrt

from django.db import models
from .models import Station, Department, MasterTable, Level, HierarchyStructure # Import your existing models

# ---------------------------------------------------------
# 1. BIOMETRIC DEVICE CONFIGURATION
# ---------------------------------------------------------
class BiometricDevice(models.Model):
    name = models.CharField(max_length=100, help_text="e.g. Main Gate, Lathe Shop Device")
    ip_address = models.GenericIPAddressField(null=True, blank=True, help_text="e.g. 192.168.1.50")
    port = models.IntegerField(default=85)
    serial_number = models.CharField(max_length=50,unique=True, blank=True, help_text="SN from Device Sticker (CLH...)")
    # username = models.CharField(max_length=50, default="essl")
    # password = models.CharField(max_length=50, default="essl")
    
    # LOGIC SWITCH: 
    # If True: All employees in MasterTable are synced here (e.g. Main Gate).
    # If False: Only specific employees via Skill Matrix are synced here (e.g. Machines).
    is_attendance_device = models.BooleanField(default=False, help_text="If True, syncs ALL users automatically.")

    is_enrollment_device = models.BooleanField(default=False, help_text="Dojo Room Device")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.serial_number})"

# ---------------------------------------------------------
# 2. BIO USER & LOGS (For caching status)
# ---------------------------------------------------------
class BioUser(models.Model):
    employeeid = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)


    # --- NEW: Track Real Status ---
    has_face = models.BooleanField(default=False)
    has_fingerprint = models.BooleanField(default=False)
    
    last_status_sync = models.DateTimeField(null=True, blank=True, help_text="Last time we checked EasyTime for bio data")

    def __str__(self):
        return f"{self.employeeid} - {self.first_name}"

# ---------------------------------------------------------
# 3. ENROLLMENT LOG (Prevents Duplicates)
# ---------------------------------------------------------
class BiometricEnrollment(models.Model):
    """
    Tracks which employee is added to which specific device.
    """
    bio_user = models.ForeignKey(BioUser, on_delete=models.CASCADE, related_name='enrollments')
    device = models.ForeignKey(BiometricDevice, on_delete=models.CASCADE, related_name='enrolled_users')
    synced_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('bio_user', 'device') # Database-level duplicate prevention
        verbose_name = "Enrolled User Log"

    def __str__(self):
        return f"{self.bio_user.employeeid} -> {self.device.name}"


# --- NEW: FOR GRAPHS & REPORTS ---
class LocalAttendanceLog(models.Model):
    """
    Stores logs locally so you can generate graphs/reports instantly 
    without calling the slow API every time.
    """
    bio_user = models.ForeignKey(BioUser, on_delete=models.CASCADE, related_name='logs')
    device_sn = models.CharField(max_length=50) # Store SN directly for easy filtering
    punch_time = models.DateTimeField()
    area_alias = models.CharField(max_length=100, null=True, blank=True)

    log_type = models.CharField(max_length=20, default='MACHINE')
    
    # Unique constraint to prevent duplicate logs
    class Meta:
        unique_together = ('bio_user', 'punch_time', 'device_sn')
        ordering = ['-punch_time']

    def __str__(self):
        return f"{self.bio_user.employeeid} @ {self.punch_time}"
    

    
# ---------------------------------------------------------
# 4. OPERATOR DAILY SUMMARY (NEW REQ)
# ---------------------------------------------------------
class OperatorDailyLog(models.Model):
    """
    Summarizes activity: One row per Employee per Machine per Day.
    Ignored Attendance Devices (Gate).
    """
    bio_user = models.ForeignKey(BioUser, on_delete=models.CASCADE)
    device = models.ForeignKey(BiometricDevice, on_delete=models.CASCADE)
    date = models.DateField()
    
    first_punch = models.DateTimeField()
    last_punch = models.DateTimeField()
    
    # Store snapshot of names in case devices/users are deleted later
    employee_name_snapshot = models.CharField(max_length=100, blank=True)
    device_name_snapshot = models.CharField(max_length=100, blank=True)

    class Meta:
        # ENSURES: Unique record for Employee + Machine + Day
        unique_together = ('bio_user', 'device', 'date')
        ordering = ['-date', 'bio_user']

    def __str__(self):
        return f"{self.date} | {self.bio_user.first_name} @ {self.device.name}"
    
#Numax easytimepro end
 # ==================== Biometric Manmachine Interlinkage setup End =================== # 

  # ==================== Machine  ======================== #

class Machine(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='machines/', null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='machines')
    level = models.IntegerField()
    process = models.ForeignKey(Station,on_delete=models.CASCADE,related_name='stations')  # Skill required
    
    # LINK TO BIOMETRIC DEVICE for Numax easytimepro --manmachine interlinkage connect to biometric device
    biometric_device = models.OneToOneField(
        BiometricDevice, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='machine_link'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return self.name

class MachineAllocation(models.Model):
    APPROVAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    machine = models.ForeignKey(Machine, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    employee = models.ForeignKey(SkillMatrix, on_delete=models.CASCADE)
    allocated_at = models.DateTimeField(auto_now_add=True)
    approval_status = models.CharField(
        max_length=10,
        choices=APPROVAL_STATUS_CHOICES,
        default='pending'
    )

    # --- Temporary Access Fields ---
    is_temporary = models.BooleanField(
        default=False,
        help_text="If True, this is emergency/temporary access valid until access_date."
    )
    access_date = models.DateField(
        null=True,
        blank=True,
        help_text="The date this temporary access expires."
    )
    BIOMETRIC_STATUS_CHOICES = [
        ('not_synced', 'Not Synced'),
        ('active',     'Active – Unblocked on Device'),
        ('blocked',    'Blocked on Device'),
    ]
    biometric_status = models.CharField(
        max_length=20,
        choices=BIOMETRIC_STATUS_CHOICES,
        default='not_synced',
        help_text="Tracks whether the employee is active or blocked on the biometric device."
    )

    class Meta:
        # Ensure one allocation per machine-employee pair
        unique_together = ['machine', 'employee']

    # def save(self, *args, **kwargs):

    #     employee_level_value = self.employee.level.level_id
    #     # Auto-determine approval status based on employee level vs machine level
    #     if employee_level_value >= self.machine.level:
    #         self.approval_status = 'approved'
    #     else:
    #         self.approval_status = 'pending'
    #     super().save(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        # Only run this logic on the first save (i.e., when the object is new)
        # This prevents the approval_status from being overwritten by subsequent saves
        if not self.pk:
            employee_level_value = self.employee.level.level_id
            if employee_level_value >= self.machine.level:
                self.approval_status = 'approved'
            else:
                self.approval_status = 'pending'

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.machine.name} → {self.employee.employee_name} ({self.approval_status})"

    @classmethod
    def update_pending_allocations(cls):
        """
        Method to update pending allocations when employee levels change
        Call this when SkillMatrix levels are updated
        """
        pending_allocations = cls.objects.filter(approval_status='pending')
        for allocation in pending_allocations:
            # Fix: Compare actual level values
            employee_level_value = allocation.employee.level.level_id # or level.level_name
            if employee_level_value >= allocation.machine.level:
                allocation.approval_status = 'approved'
                allocation.save()

 # ==================== Machine  End======================== #


class TrainingAttendance(models.Model):
    """ Stores daily attendance for each user in a batch. """
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
    ]
    
    user = models.ForeignKey(UserRegistration, on_delete=models.CASCADE, related_name='attendances')
    batch = models.ForeignKey(TrainingBatch, on_delete=models.CASCADE, related_name='attendances', to_field='batch_id')
    day_number = models.ForeignKey(Days, on_delete=models.CASCADE, related_name='day_attendances')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES,default='Absent')
    
    # --- NEW FIELD ---
    # This field will store the actual calendar date the attendance was marked on.
    attendance_date = models.DateField(help_text="The calendar date this attendance was recorded" ,null=True, blank= True)
    
    date_marked = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['batch', 'user', 'day_number']
        # A user can only have one attendance status per day in a given batch.
        unique_together = ('user', 'batch', 'day_number')

    def _str_(self):
        return f"{self.user.first_name} - {self.batch.batch_id} - Day {self.day_number}: {self.status}"
    

class SkillMatrixFeatureFlag(models.Model):
    FEATURE_CHOICES = [
        ("ojt_evaluation", "OJT + Evaluation"),
        ("cycle_evaluation", "10 Cycle + Evaluation"),
        ("quantity_ojt_evaluation", "Quantity OJT + Evaluation"),
    ]

    feature_name = models.CharField(max_length=100, choices=FEATURE_CHOICES, unique=True)
    enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.get_feature_name_display()} → {'ON' if self.enabled else 'OFF'}"


# ================== Station Manager =================================


from django.db import models

# Define choices for minimum_level_required
LEVEL_CHOICES = [
    ('Beginner', 'Beginner'),
    ('Intermediate', 'Intermediate'),
    ('Advanced', 'Advanced'),
    ('Expert', 'Expert'),
]

class StationManager(models.Model):
    department = models.ForeignKey(
        'HierarchyStructure',
        on_delete=models.CASCADE,
        related_name='station_managers_as_department',
        null=True,
        blank=True,
    )
    station = models.ForeignKey(
        'HierarchyStructure',
        on_delete=models.CASCADE,
        related_name='station_managers_as_station',
        null=True,
        blank=True,
    )
    minimum_level_required = models.CharField(max_length=20, choices=LEVEL_CHOICES, null=True, blank=True)
    minimum_operators = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        if self.station:
            return f"Station Manager for {self.station.structure_name}"
        elif self.department:
            return f"Department Manager for {self.department.structure_name}"
        return "Station Manager - Unknown"
    
   

    class Meta:
        db_table = "station_manager"


# ================== Station Manager End =================================




# observations/models.py

from django.db import models


# --- Choices for Dropdowns and Statuses ---

class StatusChoices(models.TextChoices):
    PLANNED = 'planned', 'Planned'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED = 'completed', 'Completed'

class MonthChoices(models.TextChoices):
    JANUARY = 'January', 'January'
    FEBRUARY = 'February', 'February'
    MARCH = 'March', 'March'
    APRIL = 'April', 'April'
    MAY = 'May', 'May'
    JUNE = 'June', 'June'
    JULY = 'July', 'July'
    AUGUST = 'August', 'August'
    SEPTEMBER = 'September', 'September'
    OCTOBER = 'October', 'October'
    NOVEMBER = 'November', 'November'
    DECEMBER = 'December', 'December'
    
class ShiftChoices(models.TextChoices):
    DAY = 'Day', 'Day'
    NIGHT = 'Night', 'Night'
    GENERAL = 'General', 'General'

class ScoreChoices(models.TextChoices):
    YES = '1', 'Yes (1)'
    NO = '0', 'No (0)'
    NC = 'X', 'NC (X)'
    NA = 'N/A', 'Not Applicable'
    EMPTY = '', '-'

class ResultChoices(models.TextChoices):
    PASS = 'Pass', 'Pass'
    FAIL = 'Fail', 'Fail'
    NA = 'N/A', 'N/A'

# --- Main Models ---

class AnnualPlan(models.Model):
    """
    The high-level plan for an operator observation for a specific month and year.
    """
    employee = models.ForeignKey(
        MasterTable,
        on_delete=models.PROTECT, # Prevents deleting an operator who has plans
        related_name='annual_plans'
    )
    supervisor_name = models.CharField(max_length=100)
    # month = models.CharField(max_length=20, choices=MonthChoices.choices)
    # year = models.PositiveIntegerField()
    plan_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PLANNED
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevent creating duplicate plans for the same employee in the same month/year
        unique_together = ('employee', 'plan_date')
        ordering = ['-plan_date']

    def __str__(self):
        return f"Plan for {self.employee.full_name} on {self.plan_date}"



# ---------------------------------
# FINAL UPDATED Ten Cycle Sheet Models
# ---------------------------------
from django.db import models

# --- IMPORTANT: Adjust these import paths to match your app structure ---

from app1.models import Level  # <-- CORRECT: Import the existing Level model

# The duplicate Level class definition has been REMOVED from this file.

class TenCycleSheet(models.Model):
    # Foreign keys updated in the previous step
    annual_plan = models.OneToOneField(
        AnnualPlan,
        on_delete=models.SET_NULL, # If the plan is deleted, we don't lose the observation data.
        null=True,
        blank=True,
        related_name='tencycle_sheet' # This is the name we'll use to access the sheet from a plan instance.
    )
    employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name="tencycle_sheets")
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="tencycle_sheets")
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name="tencycle_sheets")
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="tencycle_sheets")
    
    # This now correctly points to the imported 'Level' model
    level = models.ForeignKey(Level, on_delete=models.SET_NULL, null=True, blank=True, related_name="tencycle_sheets")
    
    # --- Other fields remain the same ---
    production_engineer_name = models.CharField(max_length=100)
    qa_engineer_name = models.CharField(max_length=100)
    date = models.DateField()
    part_name = models.CharField(max_length=100, blank=True)
    sop_no = models.CharField(max_length=50, blank=True)
    checked_by = models.CharField(max_length=50, blank=True)
    verified_by = models.CharField(max_length=50, blank=True)
    reviewed_by = models.CharField(max_length=50, blank=True)
    approved_by = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"Cycle Sheet for {self.employee.emp_id} on {self.date}"


class TencycleEntrySheet(models.Model):
    sheet = models.ForeignKey(TenCycleSheet, on_delete=models.CASCADE, related_name="entries")
    s_no = models.CharField(max_length=20)
    # Questions Q1–Q4
    q1 = models.BooleanField(default=True)
    q2 = models.BooleanField(default=True)
    q3 = models.BooleanField(default=True)
    q4 = models.BooleanField(default=True)

    # NEW: Added the five state variables for General Points A
    a_q1 = models.BooleanField(default=True)
    a_q2 = models.BooleanField(default=True)
    a_q3 = models.BooleanField(default=True)
    a_q4 = models.BooleanField(default=True)
    a_q5 = models.BooleanField(default=True)
    
    general_points_a = models.BooleanField(default=True)

    # Cycle 1–10
    cycle_1 = models.FloatField(null=True, blank=True)
    cycle_2 = models.FloatField(null=True, blank=True)
    cycle_3 = models.FloatField(null=True, blank=True)
    cycle_4 = models.FloatField(null=True, blank=True)
    cycle_5 = models.FloatField(null=True, blank=True)
    cycle_6 = models.FloatField(null=True, blank=True)
    cycle_7 = models.FloatField(null=True, blank=True)
    cycle_8 = models.FloatField(null=True, blank=True)
    cycle_9 = models.FloatField(null=True, blank=True)
    cycle_10 = models.FloatField(null=True, blank=True)

    cycle_time_spec = models.CharField(max_length=20)
    avg_cycle_time = models.FloatField(null=True, blank=True)
    result_marking_b = models.BooleanField(default=True)

    cross_inspection_c = models.IntegerField()
    skill_level = models.CharField(max_length=50, blank=True)
    observation_total = models.CharField(max_length=100, blank=True)
    pass_score = models.CharField(max_length=100, blank=True)
    overall_result = models.CharField(max_length=50, blank=True)
    remark = models.TextField(blank=True)

    def __str__(self):
        return f"{self.sheet} - Row {self.s_no}"
    





class ObservationSheet(models.Model):
    """
    The main 'master' record for a submitted observation sheet.
    Holds summary info and the overall result.
    """
    # A OneToOneField ensures one plan can only ever have one observation sheet
    annual_plan = models.OneToOneField(
        AnnualPlan,
        on_delete=models.CASCADE,
        related_name='observation_sheet'
    )
    
    # Header Information
    area = models.CharField(max_length=100)
    date_of_evaluation = models.DateField()
    shift = models.CharField(max_length=20, choices=ShiftChoices.choices)
    observer_name = models.CharField(max_length=100)
    
    # Summary Scores
    total_marks = models.IntegerField()
    marks_obtained = models.IntegerField()
    percentage = models.FloatField()
    result = models.CharField(max_length=20, choices=ResultChoices.choices)
    
    # Analysis
    root_cause_analysis = models.TextField(blank=True, null=True)
    counteraction = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Sheet for {self.annual_plan.employee.full_name} on {self.date_of_evaluation}"


class ObservationLineItem(models.Model):
    """
    A single 'detail' row from the observation sheet table.
    Represents the scores for one specific question.
    """
    observation_sheet = models.ForeignKey(
        ObservationSheet,
        on_delete=models.CASCADE,
        related_name='observation_lines'
    )
    # This stores the question text directly, since you opted for a static approach.
    question_description = models.CharField(max_length=500)
    
    # Daily Scores
    day1 = models.CharField(max_length=5, choices=ScoreChoices.choices, default=ScoreChoices.EMPTY)
    day2 = models.CharField(max_length=5, choices=ScoreChoices.choices, default=ScoreChoices.EMPTY)
    day3 = models.CharField(max_length=5, choices=ScoreChoices.choices, default=ScoreChoices.EMPTY)
    day4 = models.CharField(max_length=5, choices=ScoreChoices.choices, default=ScoreChoices.EMPTY)
    day5 = models.CharField(max_length=5, choices=ScoreChoices.choices, default=ScoreChoices.EMPTY)
    day6 = models.CharField(max_length=5, choices=ScoreChoices.choices, default=ScoreChoices.EMPTY)

    # The fields from the UI that were less defined
    marks = models.CharField(max_length=10, blank=True) # The 'Marks' input field
    nc_details = models.CharField(max_length=50, blank=True) # The 'NC' input field
    
    result = models.CharField(max_length=20, choices=ResultChoices.choices)
    remarks = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Line for sheet {self.observation_sheet.id} - '{self.question_description[:30]}...'"



# LEVEL 1 MCQ 

# In your_app/models.py

from django.db import models

# ... your existing models (Subtopic, SubtopicContent, TrainingContent) ...

class Question(models.Model):
    subtopiccontent = models.ForeignKey(
        'SubtopicContent',
        on_delete=models.CASCADE,
        related_name='questions'  # Helps in querying from SubtopicContent
    )
    question_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text[:50] # Show first 50 chars in admin

class Option(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='options' # Helps in querying from Question
    )
    option_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.option_text} ({'Correct' if self.is_correct else 'Incorrect'})"
    




# ================== Biometric Realtime ==================================

# class BioUser(models.Model):
#     employeeid = models.CharField(max_length=20, unique=True)
#     first_name = models.CharField(max_length=50)
#     last_name = models.CharField(max_length=50)

#     def __str__(self):
#         return f"{self.employeeid} - {self.first_name} {self.last_name}"
    
# ================== Biometric Realtime End ==================================


#================== BiometricAttendance ==================#



class BiometricAttendance(models.Model):
    attendance_date = models.DateField(verbose_name="Attendance Date", null=True, blank=True)

    sr_no = models.IntegerField(verbose_name="Sr.No.", null=True, blank=True)
    pay_code = models.CharField(max_length=50, verbose_name="PayCode", null=True, blank=True)
    card_no = models.CharField(max_length=50, verbose_name="Card No")
    employee_name = models.CharField(max_length=100, verbose_name="Employee Name", null=True, blank=True)
    department = models.CharField(max_length=100, verbose_name="Department", null=True, blank=True)
    designation = models.CharField(max_length=100, verbose_name="Designation", null=True, blank=True)
    shift = models.CharField(max_length=20, verbose_name="Shift", null=True, blank=True)
    
    # Time fields (Start, In, Out look like standard time in the image)
    start = models.TimeField(verbose_name="Start", null=True, blank=True)
    in_time = models.TimeField(verbose_name="In", null=True, blank=True)
    out_time = models.TimeField(verbose_name="Out", null=True, blank=True)
    
    # Changed to CharField because image shows "11.37" (decimal), not "11:37:00" (Time)
    hrs_works = models.CharField(max_length=20, null=True, blank=True, verbose_name="Hrs Works")
    
    status = models.CharField(max_length=20, verbose_name="Status", null=True, blank=True)
    
    # Keeping these as CharField to handle flexible Excel data (floats or strings) safely
    early_arrival = models.CharField(max_length=50, null=True, blank=True, verbose_name="Early Arriv.")
    late_arrival = models.CharField(max_length=50, null=True, blank=True, verbose_name="Late Arriv.")
    shift_early = models.CharField(max_length=50, null=True, blank=True, verbose_name="Shift Early")
    excess_lunch = models.CharField(max_length=50, null=True, blank=True, verbose_name="Excess Lunch")
    ot = models.CharField(max_length=50, null=True, blank=True, verbose_name="Ot")
    ot_amount = models.CharField(max_length=50, null=True, blank=True, verbose_name="Ot Amount")
    
    # --- NEW FIELD ---
    os = models.CharField(max_length=50, null=True, blank=True, verbose_name="Os") 
    
    manual = models.CharField(max_length=100, null=True, blank=True, verbose_name="Manual")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Adjusted unique constraint if needed, otherwise keep as is
        unique_together = ('card_no', 'attendance_date') 

    def __str__(self):
        return f"{self.employee_name} - {self.attendance_date}"
    
    

class SystemSettings(models.Model):
    excel_source_path = models.CharField(
        max_length=500, 
        verbose_name="Excel Source Path",
        help_text="Folder path where biometric Excel files are placed",
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Setting"
        verbose_name_plural = "System Settings"

    def __str__(self):
        return f"System Settings (ID: {self.id})"
    
    @property
    def processed_folder_path(self):
        """Returns the Processed folder path based on source path"""
        if self.excel_source_path:
            import os
            return os.path.join(self.excel_source_path, "Processed")
        return None
    
#================== BiometricAttendance End ==================#

# ======================== ACTION PLAN =======================
# app/models.py
from django.db import models

class ActionItem(models.Model):
    topic = models.CharField(max_length=255)
    subtopic = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField()  # Stores the date
    
    def __str__(self):
        return f"{self.topic} - {self.subtopic}"



class ActionItemRejection(models.Model):
    topic = models.CharField(max_length=255)
    subtopic = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField()  # Stores the date
    
    def __str__(self):
        return f"{self.topic} - {self.subtopic}"
    
# ============================= END ===================

# ====================== OJT STATUS =================================

class LevelDayRequirement(models.Model):
    level = models.OneToOneField(
        "Level",
        on_delete=models.CASCADE,
        related_name="day_requirement",
        to_field="level_id"  # Important: point to the actual PK field
    )
    required_days = models.PositiveSmallIntegerField(
        help_text="Number of days needed to complete OJT"
    )

    class Meta:
        ordering = ["level__level_id"]  # Default ordering (optional but clean)

    def __str__(self):
        return f"{self.level.level_name} → {self.required_days} days"

