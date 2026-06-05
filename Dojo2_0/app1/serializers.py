
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import DailyProductionData, HumanBodyCheckSession, HumanBodyCheckSheet, HumanBodyQuestions, Level2QuantityOJTEvaluation, LevelColour, LevelDayRequirement, ManagementReview, MasterTable, OJTLevel2Quantity, User, UserRegistration
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from .models import Hq, Factory, Department, Line, SubLine, Station
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser



# serializers.py
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import User, Role

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=100)
    password = serializers.CharField(max_length=128, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip()
        password = attrs.get('password', '')

        if not email or not password:
            raise ValidationError({'error': _('Email and password are required.')})

        user = authenticate(request=self.context.get('request'), email=email, password=password)

        if user is None:
            raise ValidationError({'error': _('Invalid email or password.')})

        if not user.is_active:
            raise ValidationError({'error': _('This account is inactive. Please contact support.')})

        # IMPORTANT: only store JSON-serializable primitives in validated_data
        attrs['user_id'] = user.pk
        attrs['email'] = user.email
        # store role name instead of Role model instance
        attrs['role_name'] = getattr(user.role, 'name', None)
        return attrs



class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

    def validate_refresh_token(self, value):
        if not value:
            raise serializers.ValidationError("Refresh token is required for logout.")
        return value

from rest_framework import serializers
from .models import Role, User

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

from rest_framework import serializers
from .models import Role, User
from rest_framework.exceptions import ValidationError

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate_role(self, value):
        # Check if the role exists and is active
        try:
            role = Role.objects.get(name=value, is_active=True)
        except Role.DoesNotExist:
            raise ValidationError(f"Role '{value}' does not exist or is not active.")
        return value

    def create(self, validated_data):
        role_name = validated_data.pop('role')
        # Fetch the existing role (no get_or_create)
        role = Role.objects.get(name=role_name, is_active=True)
        password = validated_data.pop('password')
        user = User.objects.create_user(
            role=role,
            **validated_data,
            password=password
        )
        return user

    class Meta:
        model = User
        fields = ['email', 'employeeid', 'first_name', 'last_name', 'role', 'password', 'hq', 'factory', 'department']




from rest_framework import serializers
from .models import Level, Days, SubTopic, SubTopicContent, TrainingContent, Evaluation

# # Level 0
# class UserRegistrationSerializer(serializers.ModelSerializer):
#     firstName = serializers.CharField(source='first_name')
#     lastName = serializers.CharField(source='last_name')
#     phoneNumber = serializers.CharField(source='phone_number')
#     tempId = serializers.CharField(source='temp_id', read_only=True)
#     aadharNumber = serializers.CharField(source='aadhar_number', required=False, allow_null=True, allow_blank=True)
#     hasExperience = serializers.BooleanField(source='experience', default=False)
#     experienceYears = serializers.IntegerField(source='experience_years', required=False, allow_null=True)
#     companyOfExperience = serializers.CharField(source='company_of_experience', required=False, allow_null=True, allow_blank=True)

#     class Meta:
#         model = UserRegistration
#         fields = [
#             'id', 'firstName', 'lastName', 'tempId', 'email', 'phoneNumber', 'sex',
#             'created_at', 'updated_at', 'is_active', 'photo','aadharNumber', 'employment_type', 'hasExperience',
#             'experienceYears', 'companyOfExperience'
#         ]
#         extra_kwargs = {
#             'email': {'required': False, 'allow_null': True},
#             'id': {'read_only': True},
#             'created_at': {'read_only': True},
#             'updated_at': {'read_only': True},
#             'is_active': {'read_only': True},
#         }

#     def create(self, validated_data):
#         if 'email' in validated_data and validated_data['email'] == '':
#             validated_data['email'] = None
#         if 'aadhar_number' in validated_data and validated_data['aadhar_number'] == '':
#             validated_data['aadhar_number'] = None
#         if 'employment_type' in validated_data and validated_data['employment_type'] == '':
#             validated_data['employment_type'] = None
#         if 'company_of_experience' in validated_data and validated_data['company_of_experience'] == '':
#             validated_data['company_of_experience'] = None        
#         return UserRegistration.objects.create(**validated_data)
    
#     def validate(self, data):
#         """
#         Validate that experience fields are provided when has_experience is True
#         """
#         experience = data.get('experience', False)
#         experience_years = data.get('experience_years')
#         company_of_experience = data.get('company_of_experience')

#         if experience:
#             if not experience_years:
#                 raise serializers.ValidationError({
#                     'experienceYears': 'Experience years is required when experience is selected.'
#                 })
#             if not company_of_experience:
#                 raise serializers.ValidationError({
#                     'companyOfExperience': 'Company of experience is required when experience is selected.'
#                 })

#         # Validate Aadhar number format if provided
#         aadhar_number = data.get('aadhar_number')
#         if aadhar_number and len(aadhar_number) != 12:
#             raise serializers.ValidationError({
#                 'aadharNumber': 'Aadhar number must be exactly 12 digits.'
#             })

#         return data   
    


# class UserUpdateSerializer(serializers.ModelSerializer):
#     firstName = serializers.CharField(source='first_name')
#     lastName = serializers.CharField(source='last_name')
#     phoneNumber = serializers.CharField(source='phone_number')
#     tempId = serializers.CharField(source='temp_id')  
#     aadharNumber = serializers.CharField(source='aadhar_number', required=False, allow_null=True, allow_blank=True)
#     hasExperience = serializers.BooleanField(source='experience', required=False)
#     experienceYears = serializers.IntegerField(source='experience_years', required=False, allow_null=True)
#     companyOfExperience = serializers.CharField(source='company_of_experience', required=False, allow_null=True, allow_blank=True)

#     class Meta:
#         model = UserRegistration
#         fields = [
#             'id', 'firstName', 'lastName', 'tempId', 'email', 'phoneNumber', 'sex',
#             'created_at', 'updated_at', 'is_active', 'photo',
#             'aadharNumber', 'employment_type', 'hasExperience',
#             'experienceYears', 'companyOfExperience'
#         ]
#         extra_kwargs = {
#             'email': {'required': False, 'allow_null': True},
#             'department': {'required': False, 'allow_null': True, 'allow_blank': True},
#             'phoneNumber': {'required': False},
#             'id': {'read_only': True},
#             'created_at': {'read_only': True},
#             'updated_at': {'read_only': True},
#             'is_active': {'read_only': True},
#         }

#     def validate(self, data):
#         """
#         Validate that experience fields are provided when experience is True
#         """
#         experience = data.get('experience', self.instance.experience if self.instance else False)
#         experience_years = data.get('experience_years', self.instance.experience_years if self.instance else None)
#         company_of_experience = data.get('company_of_experience', self.instance.company_of_experience if self.instance else None)

#         if experience:
#             if not experience_years:
#                 raise serializers.ValidationError({
#                     'experienceYears': 'Experience years is required when experience is selected.'
#                 })
#             if not company_of_experience:
#                 raise serializers.ValidationError({
#                     'companyOfExperience': 'Company of experience is required when experience is selected.'
#                 })

#         # Validate Aadhar number format if provided
#         aadhar_number = data.get('aadhar_number')
#         if aadhar_number and len(aadhar_number) != 12:
#             raise serializers.ValidationError({
#                 'aadharNumber': 'Aadhar number must be exactly 12 digits.'
#             })

#         return data


# your_app/serializers.py

from rest_framework import serializers
from .models import UserRegistration
# Make sure to import your other models if they are in the same file
# from .models import Level, Days, SubTopic, SubTopicContent, TrainingContent, Evaluation

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    A single serializer for creating and updating UserRegistration.
    All fields are editable as per requirements.
    """
    # Map model fields to camelCase for the API
    firstName = serializers.CharField(source='first_name', required=False, allow_blank=True, allow_null=True)
    lastName = serializers.CharField(source='last_name', required=False, allow_blank=True, allow_null=True)
    phoneNumber = serializers.CharField(source='phone_number', required=False, allow_blank=True, allow_null=True)
    tempId = serializers.CharField(source='temp_id', read_only=True)
    aadharNumber = serializers.CharField(source='aadhar_number', required=False, allow_null=True, allow_blank=True)
    hasExperience = serializers.BooleanField(source='experience', default=False)
    experienceYears = serializers.IntegerField(source='experience_years', required=False, allow_null=True)
    companyOfExperience = serializers.CharField(source='company_of_experience', required=False, allow_null=True, allow_blank=True)
    dateOfBirth = serializers.DateField(source='date_of_birth', required=False, allow_null=True)

    class Meta:
        model = UserRegistration
        fields = [
            'id', 'firstName', 'lastName', 'tempId', 'email', 'phoneNumber', 'sex', 'photo',
            'aadharNumber', 'employment_type', 'hasExperience', 'experienceYears', 'companyOfExperience',
            'dateOfBirth', 'created_at', 'updated_at', 'is_active', 'batch_id'
        ]
        # Only include fields that are truly system-managed and never user-editable
        read_only_fields = ('id', 'tempId', 'batch_id', 'created_at', 'updated_at', 'is_active')
        
        # Define optional fields
        extra_kwargs = {
            'email': {'required': False, 'allow_null': True},
            'employment_type': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def _handle_empty_strings(self, validated_data):
        """Helper to convert empty strings to None for optional fields."""
        for field in ['email', 'aadhar_number', 'employment_type', 'company_of_experience']:
            if field in validated_data and validated_data[field] == '':
                validated_data[field] = None
        return validated_data

    def create(self, validated_data):
        """Handle creation, ensuring empty strings are converted to None."""
        validated_data = self._handle_empty_strings(validated_data)
        return UserRegistration.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Handle update, ensuring empty strings are converted to None."""
        validated_data = self._handle_empty_strings(validated_data)
        # Use the default update logic from the parent class
        return super().update(instance, validated_data)

    # def validate(self, data):
    #     """
    #     Custom validation for cross-field dependencies.
    #     This runs on both create and update.
    #     """
    #     # Get the current value of 'experience' from the incoming data, or from the
    #     # existing model instance if this is a partial update (PATCH).
    #     experience = data.get('experience', getattr(self.instance, 'experience', False))
        
    #     # We need the values for experienceYears and companyOfExperience from the incoming data
    #     experience_years = data.get('experience_years')
    #     company_of_experience = data.get('company_of_experience')

    #     if experience:
    #         # If experience is true, we need to check the related fields.
    #         # On PATCH, a user might not be sending these fields, so we also check the existing instance.
    #         final_experience_years = experience_years or getattr(self.instance, 'experience_years', None)
    #         final_company_of_experience = company_of_experience or getattr(self.instance, 'company_of_experience', None)

    #         if not final_experience_years:
    #             raise serializers.ValidationError({
    #                 'experienceYears': 'Experience years is required when hasExperience is true.'
    #             })
    #         if not final_company_of_experience:
    #             raise serializers.ValidationError({
    #                 'companyOfExperience': 'Company of experience is required when hasExperience is true.'
    #             })
        
    #     # All model-level validators (for name, phone, aadhar) will be run automatically.
    #     return data


# Level 0

class HumanBodyQuestionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HumanBodyQuestions
        fields = '__all__'


class HumanBodyCheckSheetSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = HumanBodyCheckSheet
        fields = ['id', 'question', 'question_text', 'answer']


class HumanBodyCheckSessionSerializer(serializers.ModelSerializer):
    sheet_answers = HumanBodyCheckSheetSerializer(many=True, read_only=True)
    overall_status = serializers.ReadOnlyField()

    class Meta:
        model = HumanBodyCheckSession
        fields = ['id', 'temp_id', 'created_at', 'sheet_answers', 'overall_status']
        



class UserWithBodyCheckSerializer(serializers.ModelSerializer):
    body_checks = serializers.SerializerMethodField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone_number = serializers.CharField()
    aadharNumber = serializers.CharField(source='aadhar_number', required=False, allow_null=True, allow_blank=True)
    hasExperience = serializers.BooleanField(source='experience', default=False)
    experienceYears = serializers.IntegerField(source='experience_years', required=False, allow_null=True)
    companyOfExperience = serializers.CharField(source='company_of_experience', required=False, allow_null=True, allow_blank=True)
    
    
    class Meta:
        model = UserRegistration
        fields = [
            'first_name', 'last_name', 'temp_id', 'email', 'phone_number', 
            'sex', 'created_at', 'is_active', 'photo','aadharNumber', 'employment_type', 'hasExperience',
            'experienceYears', 'companyOfExperience', 'body_checks','is_added_to_master', 'added_to_master_at'
        ]

    def get_body_checks(self, obj):
       
        latest_session = HumanBodyCheckSession.objects.filter(user=obj).order_by('-created_at').first()
        if not latest_session:
            latest_session = HumanBodyCheckSession.objects.filter(temp_id=obj.temp_id).order_by('-created_at').first()
        
        if not latest_session:
            return []
        
        return [{
            'id': latest_session.id,
            'temp_id': obj.temp_id,
            'check_date': latest_session.created_at,
            'overall_status': latest_session.overall_status,
        }]


# ------------------ TrainingContent Serializer ------------------
from rest_framework import serializers
from .models import Level, Days, SubTopic, SubTopicContent, TrainingContent, Evaluation

class TrainingContentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="trainingcontent_id", read_only=True)
    training_file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = TrainingContent
        fields = [
            "id",
            "trainingcontent_id",
            "subtopiccontent",
            "description",
            "training_file",
            "url_link",
        ]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.training_file:
            request = self.context.get("request")
            url = instance.training_file.url
            rep["training_file"] = request.build_absolute_uri(url) if request else url
        else:
            rep["training_file"] = None
        return rep

    def validate(self, attrs):
        if self.instance is None and not (attrs.get("training_file") or attrs.get("url_link")):
            raise serializers.ValidationError("Provide either training_file or url_link.")
        return attrs

class SubTopicContentSerializer(serializers.ModelSerializer):
    training_contents = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SubTopicContent
        fields = ["subtopiccontent_id", "subtopic", "content", "training_contents"]

    def get_training_contents(self, obj):
        request = self.context.get("request")
        return TrainingContentSerializer(obj.training_contents.all(), many=True, context={"request": request}).data

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ["evaluation_id", "evaluation_text"]

class SubTopicSerializer(serializers.ModelSerializer):
    contents = SubTopicContentSerializer(many=True)
    evaluations = EvaluationSerializer(many=True)
    days_id = serializers.IntegerField(write_only=True)  # Accept days_id in JSON
    level_id = serializers.IntegerField(write_only=True)  # Accept level_id in JSON
     
    class Meta:
        model = SubTopic
        fields = ["subtopic_id", "subtopic_name", "days_id", "level_id", "contents", "evaluations"]
     
    def create(self, validated_data):
        contents_data = validated_data.pop("contents", [])
        evaluations_data = validated_data.pop("evaluations", [])
        days_id = validated_data.pop("days_id")
        level_id = validated_data.pop("level_id")
                 
        # Get the Days and Level objects
        days_obj = Days.objects.get(days_id=days_id)
        level_obj = Level.objects.get(level_id=level_id)
        subtopic = SubTopic.objects.create(days=days_obj, level=level_obj, **validated_data)
         
        for content_data in contents_data:
            training_contents_data = content_data.pop("training_contents", [])
            subtopic_content = SubTopicContent.objects.create(subtopic=subtopic, **content_data)
            for tc_data in training_contents_data:
                TrainingContent.objects.create(subtopiccontent=subtopic_content, **tc_data)
         
        for eval_data in evaluations_data:
            Evaluation.objects.create(subtopic=subtopic, **eval_data)
         
        return subtopic

class SubTopicListSerializer(serializers.ModelSerializer):
    """Read-only serializer for listing subtopics with related info"""
    id = serializers.IntegerField(source='subtopic_id', read_only=True)
    title = serializers.CharField(source='subtopic_name', read_only=True)
    day = serializers.IntegerField(source='days.days_id', read_only=True)
    day_name = serializers.CharField(source='days.day', read_only=True)
    level_name = serializers.CharField(source='level.level_name', read_only=True)
    
    class Meta:
        model = SubTopic
        fields = ["id", "title", "day", "day_name", "level_name"]

class SubTopicAdminSerializer(serializers.ModelSerializer):
    """Write serializer for admin operations"""
    subtopic_id = serializers.IntegerField(read_only=True)
    days = serializers.PrimaryKeyRelatedField(queryset=Days.objects.all())
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())

    class Meta:
        model = SubTopic
        fields = ["subtopic_id", "subtopic_name", "days", "level"]

class DaysSerializer(serializers.ModelSerializer):
    subtopics = SubTopicListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Days
        fields = ["days_id", "day", "subtopics"]

class DaysWriteSerializer(serializers.ModelSerializer):
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all(), write_only=True)
    days_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Days
        fields = ["days_id", "day", "level"]

class LevelSerializer(serializers.ModelSerializer):
    days = DaysSerializer(many=True, read_only=True)
    subtopics = SubTopicListSerializer(many=True, read_only=True)

    class Meta:
        model = Level
        fields = ["level_id", "level_name", "days", "subtopics"]

    def create(self, validated_data):
        days_data = validated_data.pop("days", [])
        subtopics_data = validated_data.pop("subtopics", [])

        # Create Level
        level = Level.objects.create(**validated_data)

        # Create Days first
        created_days = []
        for day_data in days_data:
            day_obj = Days.objects.create(level=level, **day_data)
            created_days.append(day_obj)

        # Create SubTopics directly under level
        for st_data in subtopics_data:
            contents_data = st_data.pop("contents", [])
            evaluations_data = st_data.pop("evaluations", [])
            days_id = st_data.pop("days_id", None)

            # Find the days object from created_days
            days_obj = None
            if days_id:
                days_obj = next((d for d in created_days if d.days_id == days_id), None)
            if not days_obj and created_days:
                days_obj = created_days[0]  # Fallback to first day

            subtopic = SubTopic.objects.create(level=level, days=days_obj, **st_data)

            # SubTopicContents
            for content_data in contents_data:
                training_contents_data = content_data.pop("training_contents", [])
                subtopic_content = SubTopicContent.objects.create(subtopic=subtopic, **content_data)
                for tc_data in training_contents_data:
                    TrainingContent.objects.create(subtopiccontent=subtopic_content, **tc_data)

            # Evaluations
            for eval_data in evaluations_data:
                Evaluation.objects.create(subtopic=subtopic, **eval_data)

        return level



# ------------------ Master Table Serializer ------------------
class MasterTableSerializer(serializers.ModelSerializer):
    # Read-only field to show department name in GET responses
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    
    class Meta:
        model = MasterTable
        fields = [
            'emp_id',
            'first_name',
            'last_name',
            'department',
            'designation',        # Use the department ID for POST/PUT
            'department_name',   # Show name in GET
            'date_of_joining',
            'birth_date',
            'sex',
            'email',
            'phone'
        ]



from rest_framework import serializers
from .models import ProductionPlan

class ProductionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionPlan
        fields = '__all__'


from rest_framework import serializers
from .models import QuestionPaper

# class QuestionPaperSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuestionPaper
#         fields = "__all__"

# your_app/serializers.py
from rest_framework import serializers
from .models import QuestionPaper, Department, Line, SubLine, Station, Level, TemplateQuestion

# A simple serializer for displaying names in nested objects
class SimpleNameSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        # Dynamically get the 'name' field (e.g., department_name, line_name)
        name_field = [f for f in instance._meta.fields if f.name.endswith('_name')][0].name
        id_field = instance._meta.pk.name
        return {
            'id': getattr(instance, id_field),
            'name': getattr(instance, name_field)
        }

class DepartmentNameSerializer(SimpleNameSerializer):
    class Meta:
        model = Department
        fields = []

class LineNameSerializer(SimpleNameSerializer):
    class Meta:
        model = Line
        fields = []

class SubLineNameSerializer(SimpleNameSerializer):
    class Meta:
        model = SubLine
        fields = []

class StationNameSerializer(SimpleNameSerializer):
    class Meta:
        model = Station
        fields = []
        
class LevelNameSerializer(SimpleNameSerializer):
    class Meta:
        model = Level
        fields = []


# The main serializer for the list/detail views
class QuestionPaperSerializer(serializers.ModelSerializer):
    # Use the simple serializers for read-only nested representation
    department = DepartmentNameSerializer(read_only=True)
    line = LineNameSerializer(read_only=True)
    subline = SubLineNameSerializer(read_only=True)
    station = StationNameSerializer(read_only=True)
    level = LevelNameSerializer(read_only=True)

    # Add writable fields for the foreign keys for POST/PUT requests
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department', write_only=True, required=False, allow_null=True
    )
    line_id = serializers.PrimaryKeyRelatedField(
        queryset=Line.objects.all(), source='line', write_only=True, required=False, allow_null=True
    )
    subline_id = serializers.PrimaryKeyRelatedField(
        queryset=SubLine.objects.all(), source='subline', write_only=True, required=False, allow_null=True
    )
    station_id = serializers.PrimaryKeyRelatedField(
        queryset=Station.objects.all(), source='station', write_only=True, required=False, allow_null=True
    )
    level_id = serializers.PrimaryKeyRelatedField(
        queryset=Level.objects.all(), source='level', write_only=True
    )

    class Meta:
        model = QuestionPaper
        fields = [
            "question_paper_id",
            "question_paper_name",
            "department",
            "line",
            "subline",
            "station",
            "level",
            "file",
            "created_at",
            "updated_at",
            # Writable FK fields
            "department_id",
            "line_id",
            "subline_id",
            "station_id",
            "level_id",
        ]

# Your other serializers...
# class TemplateQuestionSerializer(serializers.ModelSerializer): ...

from rest_framework import serializers
from .models import  StationLevelQuestionPaper


class StationLevelQuestionPaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationLevelQuestionPaper
        fields = "__all__"


# from rest_framework import serializers
# from .models import TemplateQuestion


# class TemplateQuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TemplateQuestion
#         fields = "__all__"

#     def validate(self, data):
#         correct_answer = data.get("correct_answer")
#         options = [
#             data.get("option_a"),
#             data.get("option_b"),
#             data.get("option_c"),
#             data.get("option_d"),
#         ]
#         if correct_answer not in options:
#             raise serializers.ValidationError(
#                 {"correct_answer": "Correct answer must match one of the options."}
#             )
#         return data
    




from rest_framework import serializers
from .models import TemplateQuestion
from django.core.files.base import ContentFile
import base64
from django.core.files.uploadedfile import InMemoryUploadedFile
import io
from django.conf import settings


class TemplateQuestionSerializer(serializers.ModelSerializer):
    # Image fields for upload (base64 encoded)
    option_a_image_b64 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    option_b_image_b64 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    option_c_image_b64 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    option_d_image_b64 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    question_image_b64 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Read-only image URLs for response
    option_a_image_url = serializers.SerializerMethodField(read_only=True)
    option_b_image_url = serializers.SerializerMethodField(read_only=True)
    option_c_image_url = serializers.SerializerMethodField(read_only=True)
    option_d_image_url = serializers.SerializerMethodField(read_only=True)
    question_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TemplateQuestion
        fields = [
            'id', 'question_paper', 'question', 'option_a', 'option_a_image', 'option_a_image_url',
            'option_b', 'option_b_image', 'option_b_image_url', 'option_c', 'option_c_image', 
            'option_c_image_url', 'option_d', 'option_d_image', 'option_d_image_url',
            'correct_answer', 'question_image', 'question_image_url',
            'option_a_image_b64', 'option_b_image_b64', 'option_c_image_b64', 
            'option_d_image_b64', 'question_image_b64'
        ]
        read_only_fields = ['id']

    def get_option_a_image_url(self, obj):
        if obj.option_a_image:
            request = self.context.get('request')
            return obj.option_a_image.url if request else None
        return None

    def get_option_b_image_url(self, obj):
        if obj.option_b_image:
            request = self.context.get('request')
            return obj.option_b_image.url if request else None
        return None

    def get_option_c_image_url(self, obj):
        if obj.option_c_image:
            request = self.context.get('request')
            return obj.option_c_image.url if request else None
        return None

    def get_option_d_image_url(self, obj):
        if obj.option_d_image:
            request = self.context.get('request')
            return obj.option_d_image.url if request else None
        return None

    def get_question_image_url(self, obj):
        if obj.question_image:
            request = self.context.get('request')
            return obj.question_image.url if request else None
        return None

    def validate(self, data):
        correct_answer = data.get("correct_answer")
        options = [
            data.get("option_a"),
            data.get("option_b"),
            data.get("option_c"),
            data.get("option_d"),
        ]
        if correct_answer and correct_answer not in options:
            raise serializers.ValidationError(
                {"correct_answer": "Correct answer must match one of the text options."}
            )
        return data

    def create(self, validated_data):
        # Handle base64 image uploads
        validated_data = self._handle_image_uploads(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle base64 image uploads
        validated_data = self._handle_image_uploads(validated_data)
        return super().update(instance, validated_data)

    def _handle_image_uploads(self, validated_data):
        """Convert base64 images to file objects"""
        image_fields = {
            'option_a_image_b64': 'option_a_image',
            'option_b_image_b64': 'option_b_image',
            'option_c_image_b64': 'option_c_image',
            'option_d_image_b64': 'option_d_image',
            'question_image_b64': 'question_image'
        }

        for b64_field, image_field in image_fields.items():
            if b64_field in validated_data and validated_data[b64_field]:
                b64_string = validated_data.pop(b64_field)
                
                # Extract image data from base64 string
                try:
                    format, imgstr = b64_string.split(';base64,')
                    ext = format.split('/')[-1]
                    image_data = base64.b64decode(imgstr)
                    
                    # Create file object
                    filename = f"question_{int(time.time())}_{hash(imgstr) % 10000}.{ext}"
                    file_obj = ContentFile(image_data, name=filename)
                    
                    validated_data[image_field] = file_obj
                except Exception as e:
                    raise serializers.ValidationError(
                        f"Invalid image format for {b64_field}: {str(e)}"
                    )
        
        return validated_data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        base_url = request.build_absolute_uri('/')[:-1] if request else settings.BACKEND_BASE_URL
        for field in ['question_image', 'option_a_image', 'option_b_image', 'option_c_image', 'option_d_image']:
            if representation.get(field):
                representation[field] = f"{base_url}{representation[field]}"
        return representation







#serializers.py

from rest_framework import serializers
from .models import Hq, Factory, Department, Line, SubLine, Station

class HqSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hq
        fields = ['hq_id', 'hq_name']

class FactorySerializer(serializers.ModelSerializer):
    hq_name = serializers.CharField(source='hq.hq_name', read_only=True)
    
    class Meta:
        model = Factory
        fields = ['factory_id', 'factory_name', 'hq', 'hq_name']

class DepartmentSerializer(serializers.ModelSerializer):
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    hq_name = serializers.CharField(source='hq.hq_name', read_only=True)
    
    class Meta:
        model = Department
        fields = ['department_id', 'department_name', 'factory', 'factory_name', 'hq', 'hq_name']

class LineSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    hq_name = serializers.CharField(source='hq.hq_name', read_only=True)
    
    class Meta:
        model = Line
        fields = ['line_id', 'line_name', 'department', 'department_name', 'factory', 'factory_name', 'hq', 'hq_name']

class SubLineSerializer(serializers.ModelSerializer):
    line_name = serializers.CharField(source='line.line_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    hq_name = serializers.CharField(source='hq.hq_name', read_only=True)
    
    class Meta:
        model = SubLine
        fields = ['subline_id', 'subline_name', 'line', 'line_name', 'department', 'department_name', 'factory', 'factory_name', 'hq', 'hq_name']

class StationSerializer(serializers.ModelSerializer):
    subline_name = serializers.CharField(source='subline.subline_name', read_only=True)
    line_name = serializers.CharField(source='line.line_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    hq_name = serializers.CharField(source='hq.hq_name', read_only=True)
    
    class Meta:
        model = Station
        fields = ['station_id', 'station_name', 'subline', 'subline_name', 'line', 'line_name', 'department', 'department_name', 'factory', 'factory_name', 'hq', 'hq_name']



from rest_framework import serializers
from .models import HierarchyStructure

from rest_framework import serializers
from .models import HierarchyStructure

class HierarchyStructureSerializer(serializers.ModelSerializer):
    hq_name = serializers.CharField(source='hq.hq_name', read_only=True)
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    line_name = serializers.CharField(source='line.line_name', read_only=True)
    subline_name = serializers.CharField(source='subline.subline_name', read_only=True)
    station_name = serializers.CharField(source='station.station_name', read_only=True)

    class Meta:
        model = HierarchyStructure
        fields = [
            'structure_id', 
            'structure_name', 
            'hq', 'hq_name',
            'factory', 'factory_name',
            'department', 'department_name',
            'line', 'line_name',
            'subline', 'subline_name',
            'station', 'station_name',
        ]

    
    def validate_structure_data(self, value):
        """Validate that structure_data is a valid JSON object"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("structure_data must be a JSON object")
        return value
    
    def create(self, validated_data):
        """Create a new HierarchyStructure instance"""
        try:
            return super().create(validated_data)
        except Exception as e:
            raise serializers.ValidationError({
                'error': 'Failed to create hierarchy structure',
                'details': str(e)
            })
    
    def update(self, instance, validated_data):
        """Update an existing HierarchyStructure instance"""
        try:
            return super().update(instance, validated_data)
        except Exception as e:
            raise serializers.ValidationError({
                'error': 'Failed to update hierarchy structure',
                'details': str(e)
            })
        

#---------------------AR/VR------------------------
from rest_framework import serializers
from .models import ARVRTrainingContent

class ARVRTrainingContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARVRTrainingContent
        fields='__all__'

# --------------------------
# Level 2 Process Dojo
# --------------------------


from rest_framework import serializers
from .models import LevelWiseTrainingContent

class LevelWiseTrainingContentSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source="level.name", read_only=True)
    station_name = serializers.CharField(source="station.station_name", read_only=True)

    class Meta:
        model = LevelWiseTrainingContent
        fields = [
            "id",
            "level",
            "level_name",
            "station",
            "station_name",
            "content_name",
            "file",
            "url",
            "updated_at",
        ]



# ===================== Hanchou & Shokuchou ====================#

from rest_framework import serializers
from .models import HanchouExamQuestion

class HanchouExamQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HanchouExamQuestion
        fields = '__all__'

from rest_framework import serializers
from django.utils import timezone
from .models import HanchouExamResult, MasterTable
# IMPORTANT: adjust this import to where your EmployeeSerializer actually lives
# from .serializers import EmployeeSerializer  # or from .employee_serializers import EmployeeSerializer
from .serializers import MasterTableSerializer 

class HanchouExamResultSerializer(serializers.ModelSerializer):
    """
    Handles serialization for Hanchou Exam Results.
    - Expects `employee_id`, `started_at`, `submitted_at`, `total_questions`, and `score` from the client.
    - Calculates `duration_seconds` automatically.
    - The model's `save` method handles calculating `passed`.
    - Returns the full result object, including nested employee details, on read.
    """

    # --- Fields for Reading Data (Output) ---
    # Use your EmployeeSerializer to show nested employee details when retrieving results.
    # employee = EmployeeSerializer(read_only=True)
    employee = MasterTableSerializer(read_only=True)
    # A custom read-only field to show the calculated percentage.
    percentage = serializers.FloatField(read_only=True)


    # --- Field for Writing Data (Input) ---
    # This field accepts the primary key (the ID) of an employee from the frontend.
    # `source='employee'` tells DRF to use this ID to populate the 'employee' model field.
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=MasterTable.objects.all(),
        source='employee',
        write_only=True
    )

    class Meta:
        model = HanchouExamResult
        # List ALL fields that should be part of the API representation.
        # We removed 'attempt_id' and 'exam_date' as they are not in your model.
        fields = [
            'id',
            'employee',           # For reading (nested object)
            'employee_id',        # For writing (just the ID)
            'exam_name',
            'started_at',
            'submitted_at',
            'total_questions',
            'score',
            'duration_seconds',
            'pass_mark_percent',
            'passed',
            'percentage',
            'remarks'
        ]
        # Fields that are calculated or set by the server and should not be accepted from the client.
        read_only_fields = (
            'id', 
            'exam_name', 
            'duration_seconds', 
            'passed', 
            'percentage'
        )

    def validate(self, attrs):
        """
        Perform cross-field validation.
        """
        # Ensure submitted_at is not earlier than started_at.
        if attrs.get('started_at') and attrs.get('submitted_at'):
            if attrs['submitted_at'] < attrs['started_at']:
                raise serializers.ValidationError({"submitted_at": "Submission time cannot be earlier than start time."})

        # Ensure score is not greater than total_questions.
        if attrs.get('score') is not None and attrs.get('total_questions') is not None:
            if attrs['score'] > attrs['total_questions']:
                raise serializers.ValidationError({"score": "Score cannot be greater than total questions."})

        return attrs

    def create(self, validated_data):
        """
        Override the create method to add custom logic.
        """
        started_at = validated_data.get('started_at')
        submitted_at = validated_data.get('submitted_at')

        # Automatically calculate the duration if timestamps are provided.
        if started_at and submitted_at:
            duration = submitted_at - started_at
            validated_data['duration_seconds'] = int(duration.total_seconds())

        # Create the HanchouExamResult instance using the validated data.
        # The model's save() method will handle setting the `passed` field.
        return HanchouExamResult.objects.create(**validated_data)


from rest_framework import serializers
from .models import ShokuchouExamQuestion, ShokuchouExamResult, MasterTable
# IMPORTANT: adjust import path to wherever EmployeeSerializer is defined
# from .serializers import EmployeeSerializer  
from .serializers import MasterTableSerializer  


# --- SHO QUESTION SERIALIZER ---
class ShokuchouExamQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShokuchouExamQuestion
        fields = '__all__'


# --- SHO RESULT SERIALIZER ---
class ShokuchouExamResultSerializer(serializers.ModelSerializer):
    """
    Handles serialization for Shokuchou Exam Results.
    - Expects `employee_id`, `sho_started_at`, `sho_submitted_at`, `sho_total_questions`, and `sho_score` from the client.
    - Calculates `sho_duration_seconds` automatically.
    - The model's `save` method handles calculating `sho_passed`.
    - Returns the full result object, including nested employee details, on read.
    """

    # --- Output fields ---
    # employee = EmployeeSerializer(read_only=True)
    employee = MasterTableSerializer(read_only=True)
    sho_percentage = serializers.FloatField(read_only=True)

    # --- Input field ---
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=MasterTable.objects.all(),
        source='employee',
        write_only=True
    )

    class Meta:
        model = ShokuchouExamResult
        fields = [
            'id',
            'employee',             # read
            'employee_id',          # write
            'sho_exam_name',
            'sho_started_at',
            'sho_submitted_at',
            'sho_total_questions',
            'sho_score',
            'sho_duration_seconds',
            'sho_pass_mark_percent',
            'sho_passed',
            'sho_percentage',
            'sho_remarks'
        ]
        read_only_fields = (
            'id',
            'sho_exam_name',
            'sho_duration_seconds',
            'sho_passed',
            'sho_percentage'
        )

    def validate(self, attrs):
        """
        Cross-field validation for Shokuchou Exam.
        """
        if attrs.get('sho_started_at') and attrs.get('sho_submitted_at'):
            if attrs['sho_submitted_at'] < attrs['sho_started_at']:
                raise serializers.ValidationError(
                    {"sho_submitted_at": "Submission time cannot be earlier than start time."}
                )

        if attrs.get('sho_score') is not None and attrs.get('sho_total_questions') is not None:
            if attrs['sho_score'] > attrs['sho_total_questions']:
                raise serializers.ValidationError(
                    {"sho_score": "Score cannot be greater than total questions."}
                )

        return attrs

    def create(self, validated_data):
        """
        Automatically calculate sho_duration_seconds before saving.
        """
        started_at = validated_data.get('sho_started_at')
        submitted_at = validated_data.get('sho_submitted_at')

        if started_at and submitted_at:
            duration = submitted_at - started_at
            validated_data['sho_duration_seconds'] = int(duration.total_seconds())

        return ShokuchouExamResult.objects.create(**validated_data)


# your_app/serializers.py
class CardShokuchouExamResultSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for Shokuchou results, formatted for the Employee Card view.
    """
    exam_name = serializers.CharField(source='sho_exam_name')
    score = serializers.IntegerField(source='sho_score')
    total_questions = serializers.IntegerField(source='sho_total_questions')
    percentage = serializers.FloatField(source='sho_percentage')
    passed = serializers.BooleanField(source='sho_passed')
    submitted_at = serializers.DateTimeField(source='sho_submitted_at')

    class Meta:
        model = ShokuchouExamResult
        fields = (
            'id',
            'exam_name',
            'score',
            'total_questions',
            'percentage',
            'passed',
            'submitted_at',
        )



# yourapp/serializers.py

# ... other imports ...
from .models import HanchouExamResult # Make sure to import the model

# ... other serializers ...

# ★★★ NEW SERIALIZER FOR THE EMPLOYEE HISTORY CARD ★★★
class CardHanchouExamResultSerializer(serializers.ModelSerializer):
    """
    A read-only serializer to format Hanchou exam results for the employee card view.
    It provides a clean, flat structure.
    """
    # The 'percentage' field is a @property on the model, so we declare it here
    # to ensure it's included in the serialization.
    percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = HanchouExamResult
        # List the specific fields you want to show in "Card 6" of your React component.
        fields = [
            'id',
            'exam_name',
            'score',
            'total_questions',
            'percentage',
            'passed',
            'submitted_at',
        ]


from .models import HanContent,ShoContent,ShoTrainingContent,ShoSubtopic
from .models import HanTrainingContent

# your_app/serializers.py

from rest_framework import serializers
from .models import HanContent, HanSubtopic, HanTrainingContent

from django.urls import reverse # <-- IMPORT reverse


# --- THIS IS THE CORRECTED HAN SERIALIZER ---
class HanTrainingContentSerializer(serializers.ModelSerializer):
    # This field accepts the file during an upload (POST/PUT).
    # It won't be included in the response (GET).
    training_file = serializers.FileField(write_only=True, required=False)

    # This field is what your React frontend will receive.
    # It's read-only because it's generated by the method below.
    training_file_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = HanTrainingContent
        # FIX #1: Added 'training_file_url' to this list.
        fields = [
            'id',
            'description',
            'training_file',       # For uploads
            'training_file_url',   # For downloads
            'url_link',
            'han_subtopic'
        ]
        # This part is correct, it hides the subtopic object from the response.
        extra_kwargs = {'han_subtopic': {'write_only': True}}

    # FIX #2: Renamed this method from get_training_file to get_training_file_url
    # The name MUST match the field it's for: get_<field_name>
    def get_training_file_url(self, obj):
        """
        This method is called by DRF to populate the 'training_file_url' field.
        """
        if obj.training_file and hasattr(obj.training_file, 'url'):
            request = self.context.get('request')
            # This part is correct, it looks up your named URL
            serve_url = reverse('serve-han-material-file', kwargs={'pk': obj.pk})
            # This part is correct, it builds the full URL
            return request.build_absolute_uri(serve_url)
        return None



# --- MODIFIED SUBTOPIC SERIALIZER ---
class HanSubtopicSerializer(serializers.ModelSerializer):
    materials = HanTrainingContentSerializer(many=True, read_only=True)

    class Meta:
        model = HanSubtopic
        # We must include 'han_content' so it can be sent in a POST request.
        fields = ['id', 'title', 'materials', 'han_content']
        extra_kwargs = {'han_content': {'write_only': True}}



#  Main Topic Serializers ---

class HanContentDetailSerializer(serializers.ModelSerializer):
    """
    Serializes a SINGLE Main Topic with its full nested structure of subtopics and materials.
    This is used for the "detail" view (e.g., GET /api/han-content/1/).
    """
    # The 'subtopics' field matches the `related_name` in the HanSubtopic model.
    subtopics = HanSubtopicSerializer(many=True, read_only=True)

    class Meta:
        model = HanContent
        fields = ['id', 'title', 'subtopics']


class HanContentListSerializer(serializers.ModelSerializer):
    """
    Serializes a Main Topic for a list view.
    It's lightweight and only includes the essential info.
    This is used for the "list" view (e.g., GET /api/han-content/).
    """
    class Meta:
        model = HanContent
        fields = ['id', 'title']





from django.urls import reverse
from rest_framework import serializers
from .models import ShoContent, ShoSubtopic, ShoTrainingContent


# --- THIS IS THE CORRECTED SHO SERIALIZER ---
class ShoTrainingContentSerializer(serializers.ModelSerializer):
    # This field accepts the file during an upload (POST/PUT).
    training_file = serializers.FileField(write_only=True, required=False)

    # This field is what your React frontend will receive.
    training_file_url = serializers.SerializerMethodField(read_only=True)

    # RENAMED for consistency with the Han serializer and the React frontend.
    # The frontend expects 'description', not 'sho_description'.
    description = serializers.CharField(source='sho_description')

    class Meta:
        model = ShoTrainingContent
        # Updated the fields list to be consistent and correct.
        fields = [
            'id',
            'description',          # Using the renamed field
            'training_file',        # For uploads
            'training_file_url',    # For downloads
            'url_link',
            'sho_subtopic'
        ]
        extra_kwargs = {'sho_subtopic': {'write_only': True}}

    # The method to generate the URL for the 'training_file_url' field.
    def get_training_file_url(self, obj):
        """
        Populates the 'training_file_url' field.
        """
        if obj.training_file and hasattr(obj.training_file, 'url'):
            request = self.context.get('request')
            # This correctly looks up the specific URL for Shokuchou files.
            serve_url = reverse('serve-sho-material-file', kwargs={'pk': obj.pk})
            return request.build_absolute_uri(serve_url)
        return None




# --- SHO SUBTOPIC SERIALIZER ---
class ShoSubtopicSerializer(serializers.ModelSerializer):
    sho_materials = ShoTrainingContentSerializer(many=True, read_only=True)

    class Meta:
        model = ShoSubtopic
        fields = ['id', 'title', 'sho_materials', 'sho_content']
        extra_kwargs = {'sho_content': {'write_only': True}}


# --- SHO CONTENT DETAIL SERIALIZER ---
class ShoContentDetailSerializer(serializers.ModelSerializer):
    # Nested subtopics with materials
    sho_subtopics = ShoSubtopicSerializer(many=True, read_only=True)

    class Meta:
        model = ShoContent
        fields = ['id', 'title', 'sho_subtopics']


# --- SHO CONTENT LIST SERIALIZER ---
class ShoContentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoContent
        fields = ['id', 'title']



#====================== hanchouend ===============================#

#=======================10 cycle starts ==========================================#
        
from rest_framework import serializers
from django.core.validators import MinValueValidator
from .models import (
    TenCycleDayConfiguration,
    TenCycleTopics,
    TenCycleSubTopic,
    TenCyclePassingCriteria,
    OperatorPerformanceEvaluation,
    EvaluationSubTopicMarks,TenCycleDailyMetrics
)
from .models import Station, Department, Level, MasterTable

from app1.serializers import (
    StationSerializer,
    DepartmentSerializer,
    LevelSerializer,
    MasterTableSerializer
)

class TenCycleDayConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenCycleDayConfiguration
        fields = ['id', 'level', 'department', 'station', 'day_name', 'sequence_order', 'is_active', 'created_at']


class TenCycleSubTopicSerializer(serializers.ModelSerializer):
    topic = serializers.PrimaryKeyRelatedField(queryset=TenCycleTopics.objects.all())

    class Meta:
        model = TenCycleSubTopic
        fields = '__all__' 


class TenCycleTopicsSerializer(serializers.ModelSerializer):
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    station = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all(), allow_null=True, required=False)

    class Meta:
        model = TenCycleTopics
        fields = ['id', 'level', 'department', 'station', 'slno', 'cycle_topics', 'is_active', 'created_at']


class TenCyclePassingCriteriaSerializer(serializers.ModelSerializer):
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    station = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all(), allow_null=True, required=False)

    class Meta:
        model = TenCyclePassingCriteria
        fields = '__all__' 

class EvaluationSubMarksSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=OperatorPerformanceEvaluation.objects.all())
    subtopic = serializers.PrimaryKeyRelatedField(queryset=TenCycleSubTopic.objects.all())
    day = serializers.PrimaryKeyRelatedField(queryset=TenCycleDayConfiguration.objects.all())

    class Meta:
        model = EvaluationSubTopicMarks
        fields = [
            'id', 'employee', 'subtopic', 'day',
            'mark_1', 'mark_2', 'mark_3', 'mark_4', 'mark_5',
            'mark_6', 'mark_7', 'mark_8', 'mark_9', 'mark_10',
            'total_score', 'max_possible_score'
        ]
        read_only_fields = ['total_score', 'max_possible_score']

    def validate(self, data):
        # Validate marks don't exceed subtopic score_required
        subtopic = data['subtopic']
        marks = [data.get(f'mark_{i}', 0) or 0 for i in range(1, 11)]
        max_score = subtopic.score_required
        for mark in marks:
            if mark > max_score:
                raise serializers.ValidationError(f"Mark {mark} exceeds maximum allowed per question {max_score}.")
        return data
    
class TenCycleDailyMetricsSerializer(serializers.ModelSerializer):
    evaluation = serializers.PrimaryKeyRelatedField(queryset=OperatorPerformanceEvaluation.objects.all())
    day = serializers.PrimaryKeyRelatedField(queryset=TenCycleDayConfiguration.objects.all())

    class Meta:
        model = TenCycleDailyMetrics
        fields = [
            'id', 'evaluation', 'day',
            'cycle_time_required',
            'cycle_time_actual_1', 'cycle_time_actual_2', 'cycle_time_actual_3',
            'cycle_time_actual_4', 'cycle_time_actual_5', 'cycle_time_actual_6',
            'cycle_time_actual_7', 'cycle_time_actual_8', 'cycle_time_actual_9',
            'cycle_time_actual_10',
            'quality_rate', 'productivity',
            'created_at', 'updated_at'
        ]




# class OperatorPerformanceEvaluationSerializer(serializers.ModelSerializer):
#     employee = serializers.PrimaryKeyRelatedField(queryset=MasterTable.objects.all())
#     department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
#     station = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all())
#     level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
    
#     passing_percentage = serializers.SerializerMethodField()
#     subtopic_marks = EvaluationSubMarksSerializer(many=True, read_only=True)
#     daily_metrics = TenCycleDailyMetricsSerializer(many=True, read_only=True)

#     class Meta:
#         model = OperatorPerformanceEvaluation
#         fields = [
#             'id',
#             'employee',
#             'date',
#             'shift',
#             'department',
#             'station',
#             'level',
#             'line',
#             'operation_no',
#             'date_of_retraining_completed',
#             'prepared_by',
#             'checked_by',
#             'approved_by',
#             'is_completed',
#             'final_percentage',
#             'final_status',
#             'created_at',
#             'updated_at',
#             'passing_percentage',
#             'subtopic_marks',      # new
#             'daily_metrics',       # new
#         ]

#     def get_passing_percentage(self, obj):
#         from .models import TenCyclePassingCriteria
#         try:
#             crit = TenCyclePassingCriteria.objects.get(
#                 level=obj.level,
#                 department=obj.department,
#                 station=obj.station
#             )
#             return crit.passing_percentage
#         except TenCyclePassingCriteria.DoesNotExist:
#             return 70.0  # updated default



       
class OperatorPerformanceEvaluationSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=MasterTable.objects.all())
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    station = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all())
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
    
    passing_percentage = serializers.SerializerMethodField()
    subtopic_marks = EvaluationSubMarksSerializer(many=True, read_only=True)
    daily_metrics = TenCycleDailyMetricsSerializer(many=True, read_only=True)
    
    # ✅ NEW
    previous_attempts = serializers.SerializerMethodField()
    max_attempts = serializers.SerializerMethodField()

    class Meta:
        model = OperatorPerformanceEvaluation
        fields = [
            'id',
            'employee',
            'date',
            'shift',
            'department',
            'station',
            'level',
            'line',
            'operation_no',
            'date_of_retraining_completed',
            'prepared_by',
            'checked_by',
            'approved_by',
            'is_completed',
            'final_percentage',
            'final_status',
            'attempt_no',                 # ✅ NEW
            'max_attempts',               # ✅ NEW
            'previous_attempts',  
            'created_at',
            'updated_at',
            'passing_percentage',
            'subtopic_marks',      # new
            'daily_metrics',       # new
        ]
        

    def get_passing_percentage(self, obj):
        from .models import TenCyclePassingCriteria
        try:
            crit = TenCyclePassingCriteria.objects.get(
                level=obj.level,
                department=obj.department,
                station=obj.station
            )
            return crit.passing_percentage
        except TenCyclePassingCriteria.DoesNotExist:
            return 70.0  # updated default
        
    def get_max_attempts(self, obj):
        from .models import RetrainingConfig
        config = RetrainingConfig.objects.filter(evaluation_type='10 Cycle').first()
        return config.max_count if config else 2

    def get_previous_attempts(self, obj):
        """List all earlier 10 Cycle attempts for same emp/level/station."""
        previous = (
            OperatorPerformanceEvaluation.objects
            .filter(employee=obj.employee, station=obj.station, level=obj.level)
            .exclude(id=obj.id)
            .order_by('attempt_no')
            .values('id', 'attempt_no', 'final_status', 'final_percentage', 'created_at')
        )
        return list(previous)




#=======================10 cycle end ==========================================#

# ====================== Machine Allocation Approval =========================== #

from rest_framework import serializers
from .models import MachineAllocation

class MachineAllocationApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = MachineAllocation
        fields = ['id', 'approval_status']



from rest_framework import serializers
from .models import MasterTable, MachineAllocation

class EmployeeWithStatusSerializer(serializers.ModelSerializer):
    approval_status = serializers.SerializerMethodField()

    class Meta:
        model = MasterTable
        fields = ['id', 'name', 'approval_status']  # include fields as needed

    def get_approval_status(self, obj):
        machine_id = self.context.get('machine_id')
        if machine_id:
            allocation = MachineAllocation.objects.filter(machine_id=machine_id, employee=obj).first()
            if allocation:
                return allocation.approval_status
        return None
    
# =========================== Machine Allocation Approval end ============================ #
#OJT serializers

# ------------------ OJT Topic ------------------

from rest_framework import serializers
from .models import OJTTopic

class OJTTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = OJTTopic
        fields =  "__all__"




# ------------------ OJT Days ------------------
from rest_framework import serializers
from .models import OJTDay

class OJTDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = OJTDay
        fields =  "__all__"





from rest_framework import serializers
from .models import OJTScoreRange

class OJTScoreRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OJTScoreRange
        fields =  "__all__"






from rest_framework import serializers
from .models import OJTScore

class OJTScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = OJTScore
        fields = ['topic', 'day', 'score']






from rest_framework import serializers
from .models import OJTPassingCriteria


class OJTPassingCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = OJTPassingCriteria
        fields = "__all__"







from rest_framework import serializers
from .models import TraineeInfo, OJTScore


class OJTScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = OJTScore
        fields = ["id", "topic", "day", "score"]



# class TraineeInfoSerializer(serializers.ModelSerializer):
#     scores = OJTScoreSerializer(many=True, write_only=True)
#     scores_data = OJTScoreSerializer(source='scores', many=True, read_only=True)

#     station = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all())
#     station_name = serializers.CharField(source='station.station_name', read_only=True)

#     level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
#     level_name = serializers.CharField(source='level.level_name', read_only=True)

#     class Meta:
#         model = TraineeInfo
#         fields = [
#             'id', 'trainee_name', 'trainer_id', 'emp_id',
#             'line', 'subline', 'station', 'station_name',
#             'process_name', 'revision_date', 'doj', 'trainer_name', 'status',
#             'scores', 'scores_data', 'level', 'level_name'
#         ]
#         # ✅ Disable automatic unique_together validation
#         validators = []

#     def validate(self, data):
#         if 'emp_id' in data and (not data['emp_id'] or data['emp_id'].strip() == ''):
#             raise serializers.ValidationError({"emp_id": "This field is required and cannot be empty."})
#         return data

#     def create(self, validated_data):
#         scores_data = validated_data.pop('scores', [])
#         trainee = TraineeInfo.objects.create(**validated_data)
#         for score in scores_data:
#             OJTScore.objects.create(trainee=trainee, **score)
#         return trainee

#     def update(self, instance, validated_data):
#         scores_data = validated_data.pop('scores', [])
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
#         instance.scores.all().delete()
#         for score in scores_data:
#             OJTScore.objects.create(trainee=instance, **score)
#         return instance






class TraineeInfoSerializer(serializers.ModelSerializer):
    scores = OJTScoreSerializer(many=True, write_only=True)
    scores_data = OJTScoreSerializer(source='scores', many=True, read_only=True)

    station = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all())
    station_name = serializers.CharField(source='station.station_name', read_only=True)

    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())
    level_name = serializers.CharField(source='level.level_name', read_only=True)
    
    # NEW: expose previous attempts and max attempt limit
    previous_attempts = serializers.SerializerMethodField()
    max_attempts = serializers.SerializerMethodField()

    class Meta:
        model = TraineeInfo
        fields = [
            'id', 'trainee_name', 'trainer_id', 'emp_id',
            'line', 'subline', 'station', 'station_name',
            'process_name', 'revision_date', 'doj', 'trainer_name', 'status',
            'scores', 'scores_data', 'level', 'level_name','prepared_by',
            'approved_by',
            'attempt_no',           # ✅ newly added
            'max_attempts',         # ✅ how many attempts allowed (from RetrainingConfig)
            'previous_attempts', 
            'created_at','updated_at', 
        ]
        # ✅ Disable automatic unique_together validation
        validators = []
        
    def get_max_attempts(self, obj):
        from .models import RetrainingConfig
        config = RetrainingConfig.objects.filter(evaluation_type='OJT').first()
        return config.max_count if config else 2

    def get_previous_attempts(self, obj):
        """Return earlier OJT attempts for same employee/station/level"""
        previous = (
            TraineeInfo.objects
            .filter(emp_id=obj.emp_id, station=obj.station, level=obj.level)
            .exclude(id=obj.id)
            .order_by('attempt_no')
            .values('id', 'attempt_no', 'status', 'doj')
        )
        return list(previous)

    def validate(self, data):
        if 'emp_id' in data and (not data['emp_id'] or data['emp_id'].strip() == ''):
            raise serializers.ValidationError({"emp_id": "This field is required and cannot be empty."})
        return data

    def create(self, validated_data):
        scores_data = validated_data.pop('scores', [])
        trainee = TraineeInfo.objects.create(**validated_data)
        for score in scores_data:
            OJTScore.objects.create(trainee=trainee, **score)
        return trainee

    def update(self, instance, validated_data):
        scores_data = validated_data.pop('scores', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        instance.scores.all().delete()
        for score in scores_data:
            OJTScore.objects.create(trainee=instance, **score)
        return instance







from rest_framework import serializers
from .models import QuantityOJTScoreRange, QuantityPassingCriteria
from app1.models import Department, Level  # ✅ import your related models


class QuantityOJTScoreRangeSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())

    class Meta:
        model = QuantityOJTScoreRange
        fields = [
            "id",
            "department", "level",
            "production_min_score", "production_max_score",
            "rejection_min_score", "rejection_max_score",
        ]


class QuantityPassingCriteriaSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())

    class Meta:
        model = QuantityPassingCriteria
        fields = [
            "id",
            "department", "level",
            "production_passing_percentage",
            "rejection_passing_percentage",
        ]






from rest_framework import serializers
from .models import OJTLevel2Quantity, Level2QuantityOJTEvaluation, Level


class Level2QuantityOJTEvaluationSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()  # ✅ auto-calculated field

    class Meta:
        model = Level2QuantityOJTEvaluation
        fields = [
            "id", "day", "date", "plan", "production_actual",
            "production_marks", "rejection_marks",
            "number_of_rejections", "percentage"  # ✅ removed production_total & rejection_total
        ]


class OJTLevel2QuantitySerializer(serializers.ModelSerializer):
    evaluations = Level2QuantityOJTEvaluationSerializer(many=True, write_only=True)
    evaluations_data = Level2QuantityOJTEvaluationSerializer(source="evaluations", many=True, read_only=True)
    level = serializers.PrimaryKeyRelatedField(queryset=Level.objects.all())

    class Meta:
        model = OJTLevel2Quantity
        fields = [
            "id", "level", "trainee_name", "trainee_id", "emp_id",
            "station", "line_name", "process_name",
            "revision_date", "doj", "trainer_name",
            "evaluations", "evaluations_data",
            "engineer_judge", "status"
        ]

    def create(self, validated_data):
        evaluations_data = validated_data.pop("evaluations", [])
        trainee = OJTLevel2Quantity.objects.create(**validated_data)
        for eval_data in evaluations_data:
            Level2QuantityOJTEvaluation.objects.create(ojt_record=trainee, **eval_data)
        return trainee

    def update(self, instance, validated_data):
        evaluations_data = validated_data.pop("evaluations", [])
        # update trainee fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # replace evaluations
        instance.evaluations.all().delete()
        for eval_data in evaluations_data:
            Level2QuantityOJTEvaluation.objects.create(ojt_record=instance, **eval_data)
        return instance


    

# =================== Refreshment Training ============================= #

from rest_framework import serializers
from .models import Training_category, Curriculum, CurriculumContent, Trainer_name, Venues, Schedule, MasterTable,EmployeeAttendance,RescheduleLog

class Training_categorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Training_category
        fields = '__all__'

class CurriculumSerializer(serializers.ModelSerializer):
    category = Training_categorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Training_category.objects.all(), source='category', write_only=True)

    class Meta:
        model = Curriculum
        fields = ['id', 'category', 'category_id', 'topic', 'description']

class CurriculumContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurriculumContent
        fields = '__all__'

class Trainer_nameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer_name
        fields = '__all__'

class VenuesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venues
        fields = '__all__'

class RefresherOperatorMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterTable
        # fields = ['id', 'employee_code', 'full_name']
        fields = ['emp_id', 'first_name', 'last_name']

class ScheduleSerializer(serializers.ModelSerializer):
    training_category = Training_categorySerializer(read_only=True)
    training_category_id = serializers.PrimaryKeyRelatedField(queryset=Training_category.objects.all(), source='training_category', write_only=True)

    training_name = CurriculumSerializer(read_only=True)
    training_name_id = serializers.PrimaryKeyRelatedField(queryset=Curriculum.objects.all(), source='training_name', write_only=True)

    trainer = Trainer_nameSerializer(read_only=True)
    trainer_id = serializers.PrimaryKeyRelatedField(queryset=Trainer_name.objects.all(), source='trainer', write_only=True)

    venue = VenuesSerializer(read_only=True)
    venue_id = serializers.PrimaryKeyRelatedField(queryset=Venues.objects.all(), source='venue', write_only=True)

    employees = RefresherOperatorMasterSerializer(many=True, read_only=True)
    employee_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=MasterTable.objects.all(), write_only=True, source='employees')

    class Meta:
        model = Schedule
        fields = ['id', 'training_category', 'training_category_id', 'training_name', 'training_name_id',
                  'trainer', 'trainer_id', 'venue', 'venue_id', 'status', 'date', 'time',
                  'employees','employee_ids']


class EmployeeAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeAttendance
        fields = [
            'id',
            'schedule',
            'employee',
            'status',
            'notes',
            'reschedule_date',
            'reschedule_time',
            'reschedule_reason',
            'updated_at',
        ]
        read_only_fields = ['updated_at']


class RescheduleLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RescheduleLog
        fields='__all__'

# =================== Refreshment Training End ============================= #

from rest_framework import serializers
from .models import Department, Station, StationSetting

class DepartmentselectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['department_id', 'department_name']

class StationselectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['station_id', 'station_name']



from rest_framework import serializers
from .models import StationSetting, Department, Station

class StationSettingSerializer(serializers.Serializer):
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department', write_only=True
    )
    station_id = serializers.PrimaryKeyRelatedField(
        queryset=Station.objects.all(), source='station', write_only=True
    )
    options = serializers.ListField(
        child=serializers.ChoiceField(choices=StationSetting.SETTING_CHOICES)
    )

    def create(self, validated_data):
        department = validated_data['department']
        station = validated_data['station']
        options = validated_data['options']
        created = []
        for opt in options:
            setting = StationSetting.objects.create(
                department=department,
                station=station,
                option=opt
            )
            created.append(setting)
        return created

    def validate(self, data):
        department = data['department']
        station = data['station']
        if station.subline.line.department != department:
            raise serializers.ValidationError("Station does not belong to selected department.")
        
        # Always return the validated data
        return data
    

# from rest_framework import serializers
from .models import (
    KeyEvent, ConnectEvent, VoteEvent,
    TestSession, Score, MasterTable, Level, Station  # Replaced Skill with Station
)


class KeyEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyEvent
        fields = "__all__"


class ConnectEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectEvent
        fields = "__all__"


class VoteEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoteEvent
        fields = "__all__"


class TestSessionSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source="department.department_name", read_only=True, default="")
    employee_name = serializers.SerializerMethodField()
    level_name = serializers.CharField(source="level.level_name", read_only=True)
    skill_name = serializers.CharField(source="skill.station_name", read_only=True, default="")  # Updated to skill.station_name

    class Meta:
        model = TestSession
        fields = [
            "id", "key_id", "employee", "employee_name","department",
            "level", "level_name", "skill", "skill_name"
        ]

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"



# class ScoreSerializer(serializers.ModelSerializer):
#     employee_id = serializers.CharField(source="employee.emp_id", read_only=True)
#     name = serializers.SerializerMethodField()
#     section = serializers.CharField(source="employee.section", default="", read_only=True)
#     department = serializers.SerializerMethodField()
#     level_name = serializers.CharField(source="level.level_name", read_only=True, default="")
#     skill = serializers.CharField(source="skill.station_name", read_only=True, default="")
#     total_questions = serializers.SerializerMethodField()
#     test_name = serializers.CharField(source="test.key_id", read_only=True)

#     class Meta:
#         model = Score
#         fields = [
#             "employee_id", "name", "section", "department",
#             "marks", "percentage", "total_questions",
#             "passed", "test_name", "created_at", "level_name", "skill"
#         ]

#     def get_name(self, obj):
#         return f"{obj.employee.first_name} {obj.employee.last_name}"

#     def get_department(self, obj):
#         print(f"Score.department: {obj.department}")
#         print(f"Employee.department: {obj.employee.department if obj.employee else None}")
#         print(f"Test.department: {obj.test.department if obj.test else None}")
#         if obj.department:
#             return obj.department.department_name
#         elif obj.employee and obj.employee.department:
#             return obj.employee.department.department_name
#         elif obj.test and obj.test.department:
#             return obj.test.department.department_name
#         return "N/A"

#     def get_total_questions(self, obj):
#         if obj.test and obj.test.question_paper:
#             return obj.test.question_paper.template_questions.count()
#         return 0







class ScoreSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(source="employee.emp_id", read_only=True)
    name = serializers.SerializerMethodField()
    section = serializers.CharField(source="employee.section", default="", read_only=True)
    department = serializers.SerializerMethodField()
    level_name = serializers.CharField(source="level.level_name", read_only=True, default="")
    skill = serializers.CharField(source="skill.station_name", read_only=True, default="")
    total_questions = serializers.SerializerMethodField()
    test_name = serializers.CharField(source="test.key_id", read_only=True)

     # ⭐ ADDED: Primary Keys (IDs) for Matrix Navigation ⭐
    level_id = serializers.IntegerField(source="level.level_id", read_only=True)
    station_id = serializers.IntegerField(source="skill.station_id", read_only=True) # Assuming Station PK is 'id'


    class Meta:
        model = Score
        fields = [
            "id",
            "employee_id", "name", "section", "department",
            "marks", "percentage", "total_questions",
            "passed", "test_name", "created_at", "level_name", "skill",
            "level_id", 
            "station_id","attempt_no"
        ]

    def get_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    def get_department(self, obj):
        print(f"Score.department: {obj.department}")
        print(f"Employee.department: {obj.employee.department if obj.employee else None}")
        print(f"Test.department: {obj.test.department if obj.test else None}")
        if obj.department:
            return obj.department.department_name
        elif obj.employee and obj.employee.department:
            return obj.employee.department.department_name
        elif obj.test and obj.test.department:
            return obj.test.department.department_name
        return "N/A"

    def get_total_questions(self, obj):
        if obj.test and obj.test.question_paper:
            return obj.test.question_paper.template_questions.count()
        return 0










class SimpleScoreSerializer(serializers.Serializer):
    employee_id = serializers.IntegerField()
    name = serializers.CharField()
    marks = serializers.IntegerField()
    percentage = serializers.FloatField()
    level_name = serializers.CharField()
    skill_name = serializers.CharField()
    section = serializers.CharField()


from rest_framework import serializers
from .models import CompanyLogo

class CompanyLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyLogo
        fields = ['id', 'name', 'logo', 'uploaded_at']



        
from rest_framework import viewsets
from .models import CompanyLogo
from .serializers import CompanyLogoSerializer

from .models import EvaluationPassingCriteria, Level, Department

class EvaluationPassingCriteriaSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.level_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    
    class Meta:
        model = EvaluationPassingCriteria
        fields = ['id', 'level', 'department', 'percentage', 'level_name', 'department_name']



# =================== Retraining start ============================= #

# =================== Retraining start ============================= #

from .models import RetrainingSession, RetrainingConfig, RetrainingSessionDetail

class RetrainingConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetrainingConfig
        fields = "_all_"
      

class RetrainingSessionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetrainingSessionDetail
        fields = [
            'id', 'retraining_session', 'observations_failure_points', 
            'trainer_name', 'created_at', 'updated_at'
        ]

class RetrainingSessionSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    level_name = serializers.CharField(source='level.level_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    station_name = serializers.CharField(source='station.station_name', read_only=True)
    session_detail = RetrainingSessionDetailSerializer(read_only=True)

    class Meta:
        model = RetrainingSession
        fields = [
            'id', 'employee', 'employee_name', 'level', 'level_name', 'department', 'department_name',
            'station', 'station_name', 'evaluation_type', 'scheduled_date', 'scheduled_time', 'venue',
            'status', 'attempt_no', 'performance_percentage', 'required_percentage', 'created_at', 'session_detail'
        ]

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name or ''} {obj.employee.last_name or ''}".strip()
    


#=======================10 cycle end ==========================================#


from rest_framework import serializers
from .models import  QuantityPassingCriteria


from rest_framework import serializers
from .models import QuantityScoreSetup

class QuantityScoreSetupSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)

    class Meta:
        model = QuantityScoreSetup
        fields = [
            "id",
            "department", "department_name",
            "level", "level_name",
            "score_type",
            "min_value", "max_value",
            "marks",
        ]



class QuantityPassingCriteriaSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)

    class Meta:
        model = QuantityPassingCriteria
        fields = [
            "id",
            "department", "department_name",
            "level", "level_name",
            "production_passing_percentage",
            "rejection_passing_percentage"
        ]

# =================== Retraining end ============================= #


from rest_framework import serializers
from .models import AssessmentMode

class AssessmentModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentMode
        fields = ['mode', 'updated_at']


class LevelColourSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.level_name', read_only=True)
    level_id = serializers.IntegerField(source='level.level_id', read_only=True)
    level_number = serializers.IntegerField(source='level.level_id', read_only=True)  # Use level_id as level_number
    
    class Meta:
        model = LevelColour
        fields = ['id', 'colour_code', 'level', 'level_name', 'level_id', 'level_number']


class LevelSerializer(serializers.ModelSerializer):
    days = DaysSerializer(many=True, read_only=True)
    subtopics = SubTopicListSerializer(many=True, read_only=True)
    colours = LevelColourSerializer(many=True, read_only=True)

    class Meta:
        model = Level
        fields = ["level_id", "level_name", "days", "subtopics","colours"]

    def create(self, validated_data):
        days_data = validated_data.pop("days", [])
        subtopics_data = validated_data.pop("subtopics", [])

        # Create Level
        level = Level.objects.create(**validated_data)

        # Create Days first
        created_days = []
        for day_data in days_data:
            day_obj = Days.objects.create(level=level, **day_data)
            created_days.append(day_obj)

        # Create SubTopics directly under level
        for st_data in subtopics_data:
            contents_data = st_data.pop("contents", [])
            evaluations_data = st_data.pop("evaluations", [])
            days_id = st_data.pop("days_id", None)

            # Find the days object from created_days
            days_obj = None
            if days_id:
                days_obj = next((d for d in created_days if d.days_id == days_id), None)
            if not days_obj and created_days:
                days_obj = created_days[0]  # Fallback to first day

            subtopic = SubTopic.objects.create(level=level, days=days_obj, **st_data)

            # SubTopicContents
            for content_data in contents_data:
                training_contents_data = content_data.pop("training_contents", [])
                subtopic_content = SubTopicContent.objects.create(subtopic=subtopic, **content_data)
                for tc_data in training_contents_data:
                    TrainingContent.objects.create(subtopiccontent=subtopic_content, **tc_data)

            # Evaluations
            for eval_data in evaluations_data:
                Evaluation.objects.create(subtopic=subtopic, **eval_data)

        return level

from rest_framework import serializers
from .models import SkillMatrixDisplaySetting

class SkillMatrixDisplaySettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillMatrixDisplaySetting
        fields = ['display_shape']




class DepartmentReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            'department_id', 
            'department_name', 
        ]
class LineReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Line
        fields = [
            'line_id', 
            'line_name', 
        ]
class SubLineReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubLine
        fields = [
            'subline_id', 
            'subline_name', 
        ]

class StationReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = [
            'station_id', 
            'station_name', 
        ]





from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField()
    employee_name = serializers.SerializerMethodField()
    level_name = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    is_recent = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'recipient',
            'recipient_name', 'recipient_email', 'employee', 'employee_name',
            'level', 'level_name', 'training_schedule', 'machine_allocation',
            'test_session', 'retraining_session', 'human_body_check_session',
            'is_read', 'is_sent', 'read_at', 'created_at', 'sent_at', 'metadata',
            'priority', 'time_ago', 'is_recent'
        ]
        read_only_fields = ['id', 'created_at', 'sent_at', 'time_ago', 'is_recent']

    def get_recipient_name(self, obj):
        """Get recipient's full name"""
        if obj.recipient:
            return f"{obj.recipient.first_name} {obj.recipient.last_name}".strip()
        return None

    def get_employee_name(self, obj):
        """Get employee's name from MasterTable"""
        if obj.employee:
            return f"{obj.employee.first_name} {obj.employee.last_name}".strip()
        return None

    def get_level_name(self, obj):
        """Get level name from Level model"""
        if obj.level:
            return obj.level.level_name
        return None

    def get_time_ago(self, obj):
        """Get human-readable time difference"""
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at

        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"

    def get_is_recent(self, obj):
        """Check if notification is recent (within last 24 hours)"""
        from django.utils import timezone
        from datetime import timedelta
        return obj.created_at > timezone.now() - timedelta(hours=24)


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'title', 'message', 'notification_type', 'recipient',
            'recipient_email', 'employee', 'level', 'training_schedule',
            'machine_allocation', 'test_session', 'retraining_session',
            'human_body_check_session', 'priority', 'metadata'
        ]

    def validate(self, data):
        if not data.get('recipient') and not data.get('recipient_email'):
            raise serializers.ValidationError(
                "Either recipient or recipient_email must be specified."
            )
        return data


class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read', 'read_at']

    def update(self, instance, validated_data):
        if 'is_read' in validated_data:
            if validated_data['is_read'] and not instance.is_read:
                instance.mark_as_read()
            elif not validated_data['is_read'] and instance.is_read:
                instance.mark_as_unread()
        return instance


class NotificationStatsSerializer(serializers.Serializer):
    total_count = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    read_count = serializers.IntegerField()
    recent_count = serializers.IntegerField()
    by_type = serializers.DictField()
    by_priority = serializers.DictField()


# In app1/serializers.py

from rest_framework import serializers
from .models import Score, MasterTable # Make sure models are imported

# ... your other serializers like the original ScoreSerializer can stay here untouched ...


# ADD THIS NEW SERIALIZER CLASS
from rest_framework import serializers
from .models import Score # Make sure Score model is imported

# ... other imports ...

# CORRECTED SERIALIZER CLASS
class LevelOnePassedScoreSerializer(serializers.ModelSerializer):
    """
    A lightweight serializer specifically for listing scores of users who
    have passed an assessment. It includes readable employee and skill names.
    """
    # CHANGE 1: Use SerializerMethodField for custom fields not on the model.
    employee_details = serializers.SerializerMethodField()
    skill_name = serializers.SerializerMethodField()

    class Meta:
        model = Score
        # The fields list remains the same, as this is the desired output.
        fields = [
            'id',
            'employee_details',
            'skill_name',
            'marks',
            'percentage',
            'created_at'
        ]

    # NEW METHOD 1: This function provides the value for 'employee_details'.
    # The name must be get_<field_name>.
    def get_employee_details(self, obj):
        # 'obj' is the Score instance being serialized.
        # We assume your Score model has a ForeignKey to MasterTable named 'employee'.
        if obj.employee:
            return obj.employee.__str__()  # This calls the "FirstName LastName (EMP_ID)" method
        return "Unknown Employee"

    # NEW METHOD 2: This function provides the value for 'skill_name'.
    def get_skill_name(self, obj):
        # We assume your Score model has a ForeignKey to your Skill/Station model named 'skill'.
        if obj.skill:
            # We also assume the skill model has a field called 'station_name'.
            return obj.skill.station_name
        return "Unknown Skill"


# In serializers.py
from rest_framework import serializers
from .models import HandoverSheet, MasterTable, Department
from django.db import transaction



class HandoverSheetCreateSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(write_only=True)
    employee_id = serializers.CharField(source='employee.emp_id', read_only=True)
    distributed_department_name = serializers.CharField(write_only=True)
    line_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    station_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = HandoverSheet
        fields = [
            'employee_id',
            'emp_id',
            'industrial_experience',
            'kpapl_experience',
            'required_department_at_handover',
            'distributed_department_name',
            'line_id',  # New field
            'station_id', # New field
            'handover_date',
            'contractor_name',
            'p_and_a_name',
            'qa_hod_name',
            'is_training_completed',
            'gojo_incharge_name',
        ]

    def _get_related_objects(self, validated_data):
        """Helper to find Employee and Department objects."""
        # --- CHANGE THIS ---
        emp_id = validated_data.pop("emp_id", None) # Use pop and provide a default
        dept_name = validated_data.pop("distributed_department_name")

        # --- Handle case where emp_id might be missing ---
        if not emp_id:
            # This check is important for the update method, which may not receive an emp_id
            employee = None 
        else:
            try:
                employee = MasterTable.objects.get(emp_id=emp_id)
            except MasterTable.DoesNotExist:
                raise serializers.ValidationError(f"Employee with ID '{emp_id}' not found.")

        try:
            department = Department.objects.get(department_name=dept_name)
        except Department.DoesNotExist:
            raise serializers.ValidationError(f"Department '{dept_name}' not found.")
            
        return employee, department


    def create(self, validated_data):
        employee, department = self._get_related_objects(validated_data)
        if not employee:
            raise serializers.ValidationError("emp_id is required to create a handover.")

        # Pop the optional line and station IDs from the data
        line_id = validated_data.pop('line_id', None)
        station_id = validated_data.pop('station_id', None)

        # Find the Line and Station objects only if their IDs were provided
        line = Line.objects.get(line_id=line_id) if line_id else None
        station = Station.objects.get(station_id=station_id) if station_id else None
        
        # Prepare the fields to be saved on the HandoverSheet
        defaults = {
            "distributed_department_after_dojo": department,
            "allocated_line": line,      # Add the line object
            "allocated_station": station,  # Add the station object
            **validated_data             # Add all other fields (like experience, etc.)
        }

        # Create or update the HandoverSheet
        handover, created = HandoverSheet.objects.update_or_create(
            employee=employee,
            defaults=defaults
        )

        # Also update the employee's main record in the MasterTable
        employee.department = department
        employee.current_line = line      # Update the MasterTable's line
        employee.current_station = station  # Update the MasterTable's station
        employee.save()
        
        return handover


    def update(self, instance, validated_data):
        # This logic is almost identical to the 'create' method's updates
        new_dept_name = validated_data.pop('distributed_department_name', None)
        line_id = validated_data.pop('line_id', None)
        station_id = validated_data.pop('station_id', None)
        
        # Update department if provided
        if new_dept_name:
            try:
                new_department = Department.objects.get(department_name=new_dept_name)
                instance.distributed_department_after_dojo = new_department
                instance.employee.department = new_department
            except Department.DoesNotExist:
                raise serializers.ValidationError(f"Department '{new_dept_name}' not found.")
        
        # Update line if provided
        if line_id:
            try:
                new_line = Line.objects.get(line_id=line_id)
                instance.allocated_line = new_line
                instance.employee.current_line = new_line
            except Line.DoesNotExist:
                raise serializers.ValidationError(f"Line with ID {line_id} not found.")
        
        # Update station if provided
        if station_id:
            try:
                new_station = Station.objects.get(station_id=station_id)
                instance.allocated_station = new_station
                instance.employee.current_station = new_station
            except Station.DoesNotExist:
                raise serializers.ValidationError(f"Station with ID {station_id} not found.")

        # Save the related employee record first
        instance.employee.save()
        
        # Update all other simple fields on the HandoverSheet
        validated_data.pop('emp_id', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Save the updated HandoverSheet instance
        instance.save()
        return instance

    

from rest_framework import serializers
from .models import LevelWiseTrainingContent, TrainingTopic

class LevelWiseTrainingContentSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source="level.level_name", read_only=True)
    station_name = serializers.CharField(source="station.station_name", read_only=True)
    topic_name = serializers.CharField(source="topic.topic_name", read_only=True)  # show topic name

    class Meta:
        model = LevelWiseTrainingContent
        fields = [
            "id",
            "topic",        # FK id for create/update
            "topic_name",   # read-only name of topic
            "level",
            "level_name",
            "station",
            "station_name",
            "content_name",
            "file",
            "url",
            "updated_at",
        ]

from rest_framework import serializers
from .models import TrainingTopic

class TrainingTopicSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source="level.level_name", read_only=True)
    station_name = serializers.CharField(source="station.station_name", read_only=True)
    
    class Meta:
        model = TrainingTopic
        fields = [
            "id",
            "topic_name",
            "level",        # FK id for create/update
            "level_name",   # read-only name of level
            "station",      # FK id for create/update
            "station_name", # read-only name of station
        ]


    



class DailyProductionDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyProductionData
        fields = '__all__'


from rest_framework import serializers
from .models import SkillMatrix

class SkillMatrixSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source="level.level_name", read_only=True)
    station_name = serializers.CharField(source="hierarchy.station.station_name", read_only=True)
    department_name = serializers.CharField(source="hierarchy.department.department_name", read_only=True)
    station_id = serializers.IntegerField(source="hierarchy.station.station_id", read_only=True)
    
    class Meta:
        model = SkillMatrix
        fields = [
            "id",
            "employee_name",
            "emp_id",
            "doj",
            "level",
            "level_name",
            "hierarchy",
            "station_name",
            "station_id",
            "department_name",
            "updated_at",
]

from .models import UserManualdocs

class UserManualdocsSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserManualdocs
        fields = [
            'id', 
            'name', 
            'file', 
            'uploaded_at', 
            'updated_at',
            'file_url',
            'file_name',
            'file_extension'
        ]
        read_only_fields = ['uploaded_at', 'updated_at']

    def get_file_url(self, obj):
        """Get the full URL for the file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_file_name(self, obj):
        """Get the original filename"""
        if obj.file:
            return obj.file.name.split('/')[-1]  # Get just the filename
        return None

    def validate(self, data):
        """Custom validation to ensure file is provided"""
        file_data = data.get('file')
        
        if not file_data:
            raise serializers.ValidationError(
                "File is required."
            )
        
        return data
    
from .models import EvaluationPassingCriteria, Level, Department

class EvaluationPassingCriteriaSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.level_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    
    class Meta:
        model = EvaluationPassingCriteria
        fields = ['id', 'level', 'department', 'percentage', 'level_name', 'department_name']



# =================== TrainingAttendance ============================= #


from .models import TrainingBatch,TrainingAttendance

from .models import TrainingBatch,TrainingAttendance

class TrainingBatchSerializer(serializers.ModelSerializer):
    """ Serializer for the TrainingBatch model. """
    class Meta:
        model = TrainingBatch
        fields = ['batch_id', 'is_active', 'created_at']
        read_only_fields = ['batch_id', 'created_at']


class TrainingAttendanceSerializer(serializers.ModelSerializer):
    """ Serializer for creating/updating individual attendance records. """
    user = serializers.PrimaryKeyRelatedField(queryset=UserRegistration.objects.all())
    # The attendance_date is set by the server, so it's read-only for clients.
    attendance_date = serializers.DateField(read_only=True) 

    class Meta:
        model = TrainingAttendance
        fields = ['user', 'batch', 'day_number', 'status', 'attendance_date']


class CardTrainingAttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for showing attendance in the Employee Card view.
    """
    # Get the batch_id string directly instead of the related object ID
    batch = serializers.CharField(source='batch.batch_id', read_only=True)

    class Meta:
        model = TrainingAttendance
        # These fields match what your React interface expects
        fields = ['id', 'batch', 'day_number', 'status', 'attendance_date']


from rest_framework import serializers
from .models import RescheduledSession  # adjust import path

class CardRescheduledSessionSerializer(serializers.ModelSerializer):
    batch_id = serializers.CharField(source='batch.batch_id', read_only=True)
    original_day_number = serializers.IntegerField(source='original_day.days_id', read_only=True)
    original_day_name = serializers.CharField(source='original_day.day_name', read_only=True)
    subtopic_name = serializers.CharField(source='training_subtopic.subtopic_name', read_only=True, allow_null=True)
    
    # This was the problem — you used source= but didn't add to fields!
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)

    class Meta:
        model = RescheduledSession
        fields = [
            'id',
            'batch_id',
            'original_day_number',
            'original_day_name',
            'original_date',
            'rescheduled_date',
            'rescheduled_time',
            'training_name',
            'subtopic_name',
            'status',
            'attendance_status',
            'attendance_marked',
            'notes',
            'created_at',
            'employee_name',        # ← MUST BE HERE!
        ]


class UserForAttendanceSerializer(serializers.ModelSerializer):
    """ A simplified User serializer for nesting inside the attendance detail view. """
    attendances = serializers.SerializerMethodField()

    class Meta:
        model = UserRegistration
        fields = ['id', 'first_name', 'temp_id', 'attendances','last_name']

    def get_attendances(self, obj):
        batch_id = self.context.get('batch_id')
        if not batch_id:
            return {}
        attendances = TrainingAttendance.objects.filter(user=obj, batch=batch_id)
        return {att.day_number.days_id: att.status for att in attendances}



class BatchAttendanceDetailSerializer(serializers.Serializer):
    """
    Custom serializer for the main attendance page response.
    Combines batch info, the next day to mark, and the list of users.
    """
    batch_id = serializers.CharField()
    next_training_day_to_mark = serializers.IntegerField(allow_null=True)
    is_completed = serializers.BooleanField()
    users = UserForAttendanceSerializer(many=True)
    


from rest_framework import serializers
from .models import RescheduledSession, SubTopic, Days, UserRegistration

class SubTopicSimpleSerializer(serializers.ModelSerializer):
    """Simple serializer for SubTopic dropdown"""
    day_name = serializers.CharField(source='days.day', read_only=True)
    
    class Meta:
        model = SubTopic
        fields = ['subtopic_id', 'subtopic_name', 'day_name']

class RescheduledSessionSerializer(serializers.ModelSerializer):
    """Full serializer for RescheduledSession with nested data"""
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)
    employee_last_name = serializers.CharField(source='employee.last_name', read_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    employee_temp_id = serializers.CharField(source='employee.temp_id', read_only=True)
    batch_id = serializers.CharField(source='batch.batch_id', read_only=True)
    original_day_number = serializers.IntegerField(source='original_day.days_id', read_only=True)
    training_subtopic_name = serializers.CharField(
        source='training_subtopic.subtopic_name', 
        read_only=True,
        allow_null=True
    )
    
    # Write fields
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=UserRegistration.objects.all(),
        source='employee',
        write_only=True
    )
    batch_id_write = serializers.CharField(
        source='batch',
        write_only=True
    )
    original_day_id = serializers.PrimaryKeyRelatedField(
        queryset=Days.objects.all(),
        source='original_day',
        write_only=True
    )
    training_subtopic_id = serializers.PrimaryKeyRelatedField(
        queryset=SubTopic.objects.all(),
        source='training_subtopic',
        write_only=True,
        required=False,
        allow_null=True
    )
    attendance_photo_url = serializers.SerializerMethodField()
    def get_attendance_photo_url(self, obj):
        if obj.attendance_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attendance_photo.url)
            return obj.attendance_photo.url
        return None
    class Meta:
        model = RescheduledSession
        fields = [
            'id',
            'employee_id',
            'employee_name',
            'employee_last_name',
            'employee_email',
            'employee_temp_id',
            'batch_id',
            'batch_id_write',
            'original_day_id',
            'original_day_number',
            'original_date',
            'rescheduled_date',
            'rescheduled_time',
            'training_subtopic_id',
            'training_subtopic_name',
            'training_name',
            'notes',
            'status',
            'attendance_marked',
            'attendance_status',
            'attendance_marked_at',
            'created_at',
            'updated_at',
            'attendance_photo_url'
        ]
        read_only_fields = [
            'id',
            'attendance_marked',
            'attendance_marked_at',
            'created_at',
            'updated_at'
        ]


class RescheduledSessionCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating rescheduled sessions"""
    
    class Meta:
        model = RescheduledSession
        fields = [
            'employee',
            'batch',
            'original_day',
            'original_date',
            'rescheduled_date',
            'rescheduled_time',
            'training_subtopic',
            'training_name',
            'notes'
        ]
    
    def validate(self, data):
        """Validate that rescheduled date is in the future"""
        if data['rescheduled_date'] < timezone.now().date():
            raise serializers.ValidationError({
                'rescheduled_date': 'Rescheduled date must be in the future.'
            })
        return data


class MarkRescheduledAttendanceSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    attendance_status = serializers.ChoiceField(choices=['present', 'absent'], default='present')
    marked_by = serializers.CharField(required=False, allow_blank=True, default='Admin')
    photo = serializers.ImageField(required=False, allow_null=True)

    def validate_session_id(self, value):
        try:
            session = RescheduledSession.objects.get(id=value)
            if session.attendance_marked:
                raise serializers.ValidationError("Attendance already marked.")
            if session.status != 'scheduled':
                raise serializers.ValidationError("Only scheduled sessions can be marked.")
            # Attach session to context
            self.context['session'] = session
            return value
        except RescheduledSession.DoesNotExist:
            raise serializers.ValidationError("Session not found.")

# =================== TrainingAttendance End ============================= #




from rest_framework import serializers
from .models import AdvanceManpowerDashboard

class AdvanceManpowerDashboardSerializer(serializers.ModelSerializer):
    # Read-only fields to show names in responses (optional but helpful for debugging/display)
    hq_name = serializers.CharField(source='hq.hq_name', read_only=True)
    factory_name = serializers.CharField(source='factory.factory_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    line_name = serializers.CharField(source='line.line_name', read_only=True)
    subline_name = serializers.CharField(source='subline.subline_name', read_only=True)
    station_name = serializers.CharField(source='station.station_name', read_only=True)

    class Meta:
        model = AdvanceManpowerDashboard
        fields = '__all__' 


# serializers.py (CORRECTED)

from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist

class FlexibleRelatedField(serializers.RelatedField):
    """
    A custom field to handle a related object that can be represented
    by either its primary key (integer) or a string representation (slug_field).
    """
    default_error_messages = {
        'does_not_exist': 'Object with {slug_name}={value} does not exist.',
        'invalid_type': 'Incorrect type. Expected pk (int) or name (str), received {data_type}.',
    }

    def __init__(self, **kwargs):
        # The slug_field is the field on the related model to use for string lookups.
        self.slug_field = kwargs.pop('slug_field', 'name')
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        """
        This method is called for deserialization (write operations).
        It converts the incoming data (pk or name) into a model instance.
        """
        try:
            # If the data is an integer, treat it as a primary key.
            if isinstance(data, int):
                return self.get_queryset().get(pk=data)
            # If the data is a string, treat it as the slug_field name.
            if isinstance(data, str):
                return self.get_queryset().get(**{self.slug_field: data})
        except ObjectDoesNotExist:
            self.fail('does_not_exist', slug_name=self.slug_field, value=data)
        except (TypeError, ValueError):
            self.fail('invalid_type', data_type=type(data).__name__)

        # If data is neither an int nor a str, raise an error.
        self.fail('invalid_type', data_type=type(data).__name__)

    def to_representation(self, value):
        """
        This method is called for serialization (read operations).
        It converts the model instance into a simple representation.
        Here, we return the value of the slug_field (the name).
        """
        return getattr(value, self.slug_field)







from rest_framework import serializers
from .models import ManagementReview

# No changes needed here, this one is fine.
class ManagementReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagementReview
        fields = "__all__"




class BaseManagementReviewSerializer(serializers.ModelSerializer):
    """A base serializer to provide the 'month_year' field."""
    month_year = serializers.SerializerMethodField()

    class Meta:
        model = ManagementReview
        abstract = True 

    def get_month_year(self, obj):
        return f"{obj.year}-{str(obj.month).zfill(2)}"


# --- Now, we use the base serializer to build the others ---

class TrainingDataSerializer(BaseManagementReviewSerializer):
    class Meta:
        model = ManagementReview
        # FIX: Replaced non-existent 'month_year' with the one from our base serializer
        fields = ['month_year', 'new_operators_joined', 'new_operators_trained', 
                  'total_training_plans', 'total_trainings_actual']

class DefectsDataSerializer(BaseManagementReviewSerializer):
    class Meta:
        model = ManagementReview
        # FIX: Replaced non-existent 'month_year'
        fields = ['month_year', 'total_defects_msil', 'ctq_defects_msil', 
                  'total_defects_tier1', 'ctq_defects_tier1', 
                  'total_internal_rejection', 'ctq_internal_rejection']

class OperatorsChartSerializer(BaseManagementReviewSerializer):
    # We can rename fields directly from the model using the 'source' argument
    operators_joined = serializers.IntegerField(source='new_operators_joined')
    operators_trained = serializers.IntegerField(source='new_operators_trained')
    
    class Meta:
        model = ManagementReview
        fields = ['year', 'month_year', 'operators_joined', 'operators_trained']

class TrainingPlansChartSerializer(BaseManagementReviewSerializer):
    training_plans = serializers.IntegerField(source='total_training_plans')
    trainings_actual = serializers.IntegerField(source='total_trainings_actual')
    
    class Meta:
        model = ManagementReview
        fields = ['year', 'month_year', 'training_plans', 'trainings_actual']

class DefectsChartSerializer(BaseManagementReviewSerializer):
    defects_msil = serializers.IntegerField(source='total_defects_msil')

    class Meta:
        model = ManagementReview
        fields = ['year', 'month_year', 'defects_msil', 'ctq_defects_msil']

# ================ Emp History Card ===============================


from rest_framework import serializers
from .models import MasterTable

class CardEmployeeMasterSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source='department.department_name', read_only=True)
    class Meta:
        model = MasterTable
        # fields = [
        #     'id', 'pay_code', 'card_no', 'name', 'guardian_name', 'sex', 'birth_date',
        #     'department', 'section', 'desig_category', 'joining_date',
        #     'auth_shift', 'shift_type', 'shift_pattern',
        #     'first_weekly_off', 'second_weekly_off', 'second_weekly_off_fh',
        #     'ot_allowed_rate', 'round_the_clock'
        # ]
        fields = [
            'emp_id','first_name','last_name','department','date_of_joining','birth_date',
            'sex','email','phone',
        ]



class OperatorCardSkillSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)
    station_name = serializers.CharField(source='hierarchy.station.station_name', read_only=True)
    level_name = serializers.CharField(source='level.level_name', read_only=True)

    class Meta:
        model = SkillMatrix
        fields = ['id', 'employee_name', 'station_name', 'level_name', 'updated_at']  
        # fields = ['id', 'operator_name', 'station_name', 'level_name', 'sequence']  



from rest_framework import serializers
from .models import Score

class CardScoreSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)
    test_name = serializers.CharField(source='test.test_name', read_only=True)

    class Meta:
        model = Score
        fields = [
            'id',
            'employee_name',
            'test_name',     # just use directly if it's a model field
            'marks',
            'percentage',    # must exist in model
            'passed',        # must exist in model
            'created_at'
        ]




from rest_framework import serializers
from .models import MultiSkilling

class CardMultiSkillingSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)
    # station_number = serializers.IntegerField(source='station.station_number', read_only=True)
    # skill_level_value = serializers.CharField(source='skill_level', read_only=True)
    # skill = serializers.CharField(source='station.skill', read_only=True, allow_null=True)
    skill = serializers.CharField(source='hierarchy.station.station_name', read_only=True, allow_null=True)

    class Meta:
        model = MultiSkilling
        fields = [
            'id',
            'employee_name',
            # 'station_number',
            'skill',
            # 'skill_level_value',
            'skill_level',
            'start_date',
            # 'end_date',
            # 'notes',
            'status',
            # 'reason',
            # 'refreshment_date'
        ]



#not understand the model 
# from rest_framework import serializers
# from .models import RefreshmentTraining

# class CardRefreshmentTrainingSerializer(serializers.ModelSerializer):
#     employee_name = serializers.CharField(source='employee.name', read_only=True)
#     card_no = serializers.CharField(source='employee.card_no', read_only=True)
#     station_number = serializers.IntegerField(source='station.station_number', read_only=True)
#     skill_name = serializers.CharField(source='skill.skill', read_only=True)
#     skill_level_value = serializers.CharField(source='skill_level.skill_level', read_only=True)

#     class Meta:
#         model = RefreshmentTraining
#         fields = [
#             'id',
#             'employee_name',
#             'card_no',
#             'station_number',
#             'skill_name',
#             'skill_level_value',
#             'start_date',
#             'end_date',
#             'reason_for_refreshment',
#         ]

# THIS IS THE UPDATED VERSION
class CardScheduleSerializer(serializers.ModelSerializer):
    """
    This serializer takes a Schedule object and formats it for the
    employee history card.
    """
    
    # ★ GET related names instead of IDs
    trainer_name = serializers.CharField(source='trainer.name', read_only=True, allow_null=True)
    venue_name = serializers.CharField(source='venue.name', read_only=True, allow_null=True)

    # ★ RENAME 'training_name.topic' to be more descriptive
    topic = serializers.CharField(source='training_name.topic', read_only=True)
    
    # ★ GET the category name
    category_name = serializers.CharField(source='training_category.name', read_only=True)

    class Meta:
        model = Schedule
        # ★ UPDATE the fields list with the new data
        fields = [
            'id',
            'topic',
            'category_name',
            'trainer_name',
            'venue_name',
            'status',
            # 'created_at',
            'date'
            # 'time',  # Let's add time as well, it's useful!
        ]
    # --- ★ START: ADD THESE MISSING METHODS ★ ---


#955
# # ★★★ NEW SERIALIZER FOR THE EMPLOYEE HISTORY CARD ★★★
# class CardHanchouExamResultSerializer(serializers.ModelSerializer):
#     """
#     A read-only serializer to format Hanchou exam results for the employee card view.
#     It provides a clean, flat structure.
#     """
#     # The 'percentage' field is a @property on the model, so we declare it here
#     # to ensure it's included in the serialization.
#     percentage = serializers.FloatField(read_only=True)

#     class Meta:
#         model = HanchouExamResult
#         # List the specific fields you want to show in "Card 6" of your React component.
#         fields = [
#             'id',
#             'exam_name',
#             'score',
#             'total_questions',
#             'percentage',
#             'passed',
#             'submitted_at',
#         ]



#2331
# class CardTrainingAttendanceSerializer(serializers.ModelSerializer):
#     """
#     Serializer specifically for showing attendance in the Employee Card view.
#     """
#     # Get the batch_id string directly instead of the related object ID
#     batch = serializers.CharField(source='batch.batch_id', read_only=True)

#     class Meta:
#         model = TrainingAttendance
#         # These fields match what your React interface expects
#         fields = ['id', 'batch', 'day_number', 'status', 'attendance_date']


# ================ Emp History Card End ===============================



# ==================== MultiSkilling Start ======================== #


from rest_framework import serializers
from .models import MultiSkilling, SkillMatrix


class MultiSkillingSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(read_only=True)
    emp_id = serializers.CharField(read_only=True)
    department_name = serializers.CharField(read_only=True)   # snapshot from MasterTable
    current_status = serializers.SerializerMethodField()

    station_name = serializers.CharField(source="station.station_name", read_only=True)
    department_display = serializers.CharField(
        source="department.department_name", read_only=True
    )

    class Meta:
        model = MultiSkilling
        fields = [
            "id", "employee", "emp_id", "employee_name", "department_name", "date_of_joining",
            "department", "station", "station_name", "department_display",
            "skill_level",
            "start_date", "remarks", "status", "current_status",
            "created_at", "updated_at",
        ]

    def get_current_status(self, obj):
        """
        1. If scheduled and date <= today → in-progress
        2. If a matching SkillMatrix row exists for this employee & station with >= skill_level → completed
        """
        # today = obj.start_date
        # Default property status logic
        status_val = obj.current_status

        # Check completion in SkillMatrix
        skill_exists = SkillMatrix.objects.filter(
            employee=obj.employee,
            hierarchy__station=obj.station,
             level__level_name=obj.skill_level.level_name  # compare with required level
        ).exists()

        if skill_exists:
            return "completed"

        return status_val

# ==================== MultiSkilling End ======================== #



from .models import Machine, MachineAllocation,SkillMatrix

class MachineSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    process_name = serializers.CharField(source='process.station_name', read_only=True)
    biometric_device_name = serializers.CharField(source='biometric_device.name', read_only=True) # For Numax easytimepro

    class Meta:
        model = Machine
        fields = "__all__"

    def create(self, validated_data):
        return Machine.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def delete(self, instance):
        # Custom delete if you want control
        instance.delete()
        return instance





class MachineAllocationSerializer(serializers.ModelSerializer):
    machine_name = serializers.CharField(source='machine.name', read_only=True)
    machine_level = serializers.IntegerField(source='machine.level', read_only=True)
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)
    employee_level = serializers.IntegerField(source='employee.level.level_id', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    
    class Meta:
        model = MachineAllocation
        fields = "__all__"
        read_only_fields = ('approval_status', 'allocated_at')  # These are auto-determined

    def create(self, validated_data):
        # The approval_status will be automatically set in the model's save method
        return MachineAllocation.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()  # This will trigger the auto-approval logic
        return instance

    def validate(self, data):
        """
        Check if the allocation already exists
        """
        machine = data.get('machine')
        employee = data.get('employee')
        
        # If this is an update, exclude current instance
        if self.instance:
            existing = MachineAllocation.objects.filter(
                machine=machine, 
                employee=employee
            ).exclude(id=self.instance.id)
        else:
            existing = MachineAllocation.objects.filter(
                machine=machine, 
                employee=employee
            )
        
        if existing.exists():
            raise serializers.ValidationError(
                "This employee is already allocated to this machine."
            )
        
        return data

    def validate_employee(self, value):
            """
            Ensure the employee ID exists in SkillMatrix
            """
            try:
                SkillMatrix.objects.get(id=value.id if hasattr(value, 'id') else value)
            except SkillMatrix.DoesNotExist:
                raise serializers.ValidationError("Employee not found in skill matrix.")
            return value

# For the eligible employees endpoint
class EligibleEmployeeSerializer(serializers.ModelSerializer):
    level_value = serializers.IntegerField(source='level.level_id', read_only=True)
    is_eligible = serializers.SerializerMethodField()
    department_id = serializers.IntegerField(source='hierarchy.department.department_id', read_only=True)
    
    class Meta:
        model = SkillMatrix
        fields = ['id', 'employee_name', 'emp_id', 'level_value', 'is_eligible', 'department_id']
    
    def get_is_eligible(self, obj):
        machine_level = self.context.get('machine_level', 0)
        return obj.level.level_id >= machine_level



from rest_framework import serializers
from .models import SkillMatrixFeatureFlag

class FeatureFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillMatrixFeatureFlag
        fields = ["id", "feature_name", "enabled"]

    

# ====================== Station Manager ==========================

# # serializers.py

# from rest_framework import serializers
# from .models import StationManager, HierarchyStructure
# import logging

# logger = logging.getLogger(__name__)

# class StationManagerSerializer(serializers.ModelSerializer):
#     # 1. Use SerializerMethodField for reliable, specific name lookup
#     department_name = serializers.SerializerMethodField(read_only=True)
#     station_name = serializers.SerializerMethodField(read_only=True)
    
#     # Write fields remain the same
#     department_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
#     station_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

#     class Meta:
#         model = StationManager
#         fields = [
#             'id',
#             'department_name',
#             'station_name',
#             'department_id',
#             'station_id',
#             'minimum_level_required',
#             'minimum_operators'
#         ]

#     # --- Read Logic: Get Names ---

#     def get_department_name(self, obj):
#         # Path: StationManager.department -> HierarchyStructure.department -> Department.department_name
#         if obj.department and obj.department.department:
#             # Assuming Department model has 'department_name' field
#             return obj.department.department.department_name
#         if obj.department:
#             # Fallback to the HierarchyStructure's name
#             return obj.department.structure_name
#         return 'Unknown Department'

#     def get_station_name(self, obj):
#         # Path: StationManager.station -> HierarchyStructure.station -> Station.station_name
#         if obj.station and obj.station.station:
#             # Assuming Station model has 'station_name' field
#             return obj.station.station.station_name
#         if obj.station:
#             # Fallback to the HierarchyStructure's name
#             return obj.station.structure_name
#         return 'Unknown Station'

#     # --- Write Logic: Create/Lookup ---
    
#     def validate(self, data):
#         # Ensures at least one FK ID is present
#         if not data.get('department_id') and not data.get('station_id'):
#             raise serializers.ValidationError("At least one of department or station must be provided.")
#         return data


#     def create(self, validated_data):
#         logger.debug(f"Creating StationManager with data: {validated_data}")
#         department_pk = validated_data.pop('department_id', None)
#         station_pk = validated_data.pop('station_id', None)
        
#         department_hierarchy = None
#         station_hierarchy = None
        
#         # 1. Find the HierarchyStructure for the Department PK
#         if department_pk is not None:
#             try:
#                 # Use .filter() to handle potential MultipleObjectsReturned, then use .first()
#                 # Use the correct lookup: department__pk
#                 department_hierarchy = HierarchyStructure.objects.filter(department__pk=department_pk).first() 
                
#                 if department_hierarchy is None:
#                     raise HierarchyStructure.DoesNotExist
            
#             except HierarchyStructure.DoesNotExist:
#                 raise serializers.ValidationError(f"Hierarchy structure not found for Department ID: {department_pk}")
#             except Exception as e:
#                 # Catch any other database errors (e.g., IntegrityError, relation error)
#                 logger.error(f"FATAL DB Error during department hierarchy lookup for PK {department_pk}: {e}", exc_info=True)
#                 raise serializers.ValidationError(f"Database error during lookup for Department ID {department_pk}. Please check database integrity.")


#         # 2. Find the HierarchyStructure for the Station PK
#         if station_pk is not None:
#             try:
#                 station_hierarchy = HierarchyStructure.objects.filter(station__pk=station_pk).first()
                
#                 if station_hierarchy is None:
#                     raise HierarchyStructure.DoesNotExist
            
#             except HierarchyStructure.DoesNotExist:
#                 raise serializers.ValidationError(f"Hierarchy structure not found for Station ID: {station_pk}")
#             except Exception as e:
#                 logger.error(f"FATAL DB Error during station hierarchy lookup for PK {station_pk}: {e}", exc_info=True)
#                 raise serializers.ValidationError(f"Database error during lookup for Station ID {station_pk}. Please check database integrity.")

#         # 3. Create the StationManager object
#         station_manager = StationManager.objects.create(
#             department=department_hierarchy,
#             station=station_hierarchy,
#             **validated_data
#         )
        
#         logger.info(f"Created StationManager: ID {station_manager.id}. Lookups succeeded.")
#         return station_manager


from rest_framework import serializers
from .models import StationManager, HierarchyStructure
import logging

logger = logging.getLogger(__name__)

class StationManagerSerializer(serializers.ModelSerializer):
    # Read-only names for display
    department_name = serializers.SerializerMethodField(read_only=True)
    station_name = serializers.SerializerMethodField(read_only=True)
    
    # Write-only IDs from frontend
    department_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    station_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Add these to prevent errors if frontend sends them, even if model doesn't use them yet
    line_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    subline_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = StationManager
        fields = [
            'id',
            'department_name',
            'station_name',
            'department_id',
            'station_id',
            'line_id',    # Added
            'subline_id', # Added
            'minimum_level_required',
            'minimum_operators'
        ]

    # --- READ LOGIC ---

    def get_department_name(self, obj):
        if obj.department:
            # Check if linked to actual Department model or just use Structure name
            if hasattr(obj.department, 'department') and obj.department.department:
                return obj.department.department.department_name
            return obj.department.structure_name
        return None

    def get_station_name(self, obj):
        if obj.station:
            if hasattr(obj.station, 'station') and obj.station.station:
                return obj.station.station.station_name
            return obj.station.structure_name
        return None

    # --- HELPER: Hierarchy Lookup ---

    def _get_hierarchy_object(self, pk, type_field):
        """
        Finds the HierarchyStructure object based on the specific entity PK.
        e.g., Finds HierarchyStructure where department__pk == pk
        """
        if pk is None:
            return None
            
        try:
            # Dynamic lookup: department__pk, station__pk, etc.
            lookup = {f"{type_field}__pk": pk}
            hierarchy_obj = HierarchyStructure.objects.filter(**lookup).first()
            
            if not hierarchy_obj:
                raise serializers.ValidationError(
                    f"Hierarchy structure not found for {type_field} ID: {pk}"
                )
            return hierarchy_obj
        except Exception as e:
            logger.error(f"Error looking up hierarchy for {type_field} {pk}: {e}")
            raise serializers.ValidationError(f"Invalid {type_field} ID provided.")

    # --- CREATE ---

    def create(self, validated_data):
        # Extract IDs
        dept_pk = validated_data.pop('department_id', None)
        station_pk = validated_data.pop('station_id', None)
        
        # Remove unused fields from validated_data before creating model
        validated_data.pop('line_id', None)
        validated_data.pop('subline_id', None)

        # Lookup Hierarchy Objects
        department_hierarchy = self._get_hierarchy_object(dept_pk, 'department')
        station_hierarchy = self._get_hierarchy_object(station_pk, 'station')

        # Create
        station_manager = StationManager.objects.create(
            department=department_hierarchy,
            station=station_hierarchy,
            **validated_data
        )
        return station_manager

    # --- UPDATE (This was missing!) ---

    def update(self, instance, validated_data):
        # 1. Extract IDs (if provided in the PUT request)
        dept_pk = validated_data.pop('department_id', None)
        station_pk = validated_data.pop('station_id', None)
        
        # Remove unused fields
        validated_data.pop('line_id', None)
        validated_data.pop('subline_id', None)

        # 2. Update Standard Fields
        instance.minimum_operators = validated_data.get('minimum_operators', instance.minimum_operators)
        instance.minimum_level_required = validated_data.get('minimum_level_required', instance.minimum_level_required)

        # 3. Update Relationships (with translation logic)
        
        # Only update department if the key was actually sent in the request
        # (Check keys in self.initial_data to distinguish between "not sent" and "sent as null")
        if 'department_id' in self.initial_data:
            instance.department = self._get_hierarchy_object(dept_pk, 'department')
            
        if 'station_id' in self.initial_data:
            instance.station = self._get_hierarchy_object(station_pk, 'station')

        instance.save()
        return instance

    
# ====================== Station Manager End ==========================







# observations/serializers.py

from rest_framework import serializers
from .models import AnnualPlan, ObservationSheet, ObservationLineItem
import django.db.transaction


# Serializer for a single line item within the observation sheet
class ObservationLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObservationLineItem
        # We don't need to show the 'observation_sheet' ID on every line
        exclude = ['observation_sheet']


class ObservationSheetSerializer(serializers.ModelSerializer):
    # This field is for RECEIVING the nested line items when a sheet is CREATED.
    # It's write_only, so it won't be shown when we retrieve a sheet.
    observation_lines = ObservationLineItemSerializer(many=True, write_only=True)

    # This field is for DISPLAYING the line items when a sheet is RETRIEVED.
    # It's read_only and uses the related_name from the model.
    lines = ObservationLineItemSerializer(source='observation_lines', many=True, read_only=True)

    class Meta:
        model = ObservationSheet
        fields = [
            'id', 'annual_plan', 'area', 'date_of_evaluation', 'shift',
            'observer_name', 'total_marks', 'marks_obtained', 'percentage',
            'result', 'root_cause_analysis', 'counteraction',
            'observation_lines',  # For writing
            'lines'               # For reading
        ]

    def create(self, validated_data):
        """
        This custom create method handles the creation of the ObservationSheet
        and its related ObservationLineItems all in one transaction.
        """
        # Pop the nested line item data from the validated data
        line_items_data = validated_data.pop('observation_lines')

        # Create the main ObservationSheet instance
        observation_sheet = ObservationSheet.objects.create(**validated_data)

        # Create each ObservationLineItem, linking it to the new sheet
        for item_data in line_items_data:
            ObservationLineItem.objects.create(observation_sheet=observation_sheet, **item_data)

        return observation_sheet
    

    @django.db.transaction.atomic
    def update(self, instance, validated_data):
        # Update parent ObservationSheet fields
        instance.area = validated_data.get('area', instance.area)
        instance.date_of_evaluation = validated_data.get('date_of_evaluation', instance.date_of_evaluation)
        instance.shift = validated_data.get('shift', instance.shift)
        # ... update any other parent fields you need
        
        # Update summary scores
        instance.total_marks = validated_data.get('total_marks', instance.total_marks)
        instance.marks_obtained = validated_data.get('marks_obtained', instance.marks_obtained)
        instance.percentage = validated_data.get('percentage', instance.percentage)
        instance.result = validated_data.get('result', instance.result)
        
        instance.save()

        # Update nested ObservationLineItems
        line_items_data = validated_data.get('observation_lines', [])
        for item_data in line_items_data:
            # Find the existing line item by its unique question description
            line_item = instance.observation_lines.filter(
                question_description=item_data['question_description']
            ).first()
            
            if line_item:
                # Update the fields
                line_item.day1 = item_data.get('day1', line_item.day1)
                line_item.day2 = item_data.get('day2', line_item.day2)
                line_item.day3 = item_data.get('day3', line_item.day3)
                line_item.day4 = item_data.get('day4', line_item.day4)
                line_item.day5 = item_data.get('day5', line_item.day5)
                line_item.day6 = item_data.get('day6', line_item.day6)


                line_item.marks = item_data.get('marks', line_item.marks)
                line_item.nc_details = item_data.get('nc_details', line_item.nc_details)

                line_item.remarks = item_data.get('remarks', line_item.remarks)
                line_item.result = item_data.get('result', line_item.result)
                # ... update any other line item fields
                line_item.save()

        return instance






# --------------------END ---------------------------------------------------



from rest_framework import serializers
from .models import TenCycleSheet, TencycleEntrySheet

class TencycleEntrySheetSerializer(serializers.ModelSerializer):
    skill_level = serializers.CharField(max_length=50, allow_blank=True, required=False)
    remark = serializers.CharField(allow_blank=True, required=False)
    observation_total = serializers.CharField(max_length=100, allow_blank=True, required=False)
    pass_score = serializers.CharField(max_length=100, allow_blank=True, required=False)
    overall_result = serializers.CharField(max_length=50, allow_blank=True, required=False)
    
    class Meta:
        model = TencycleEntrySheet
        fields = [
            'id', 's_no', 'q1', 'q2', 'q3', 'q4', 
            'a_q1', 'a_q2', 'a_q3', 'a_q4', 'a_q5',
            'general_points_a', 'cycle_1', 'cycle_2', 'cycle_3', 'cycle_4', 'cycle_5',
            'cycle_6', 'cycle_7', 'cycle_8', 'cycle_9', 'cycle_10',
            'cycle_time_spec', 'avg_cycle_time', 'result_marking_b',
            'cross_inspection_c', 'skill_level', 'observation_total',
            'pass_score', 'overall_result', 'remark'
        ]


class TenCycleSheetSerializer(serializers.ModelSerializer):
    entries = TencycleEntrySheetSerializer(many=True, required=False)

    # Explicitly define fields that can be blank to override the serializer's strict default
    part_name = serializers.CharField(max_length=100, allow_blank=True, required=False)
    sop_no = serializers.CharField(max_length=50, allow_blank=True, required=False)
    checked_by = serializers.CharField(max_length=50, allow_blank=True, required=False)
    verified_by = serializers.CharField(max_length=50, allow_blank=True, required=False)
    reviewed_by = serializers.CharField(max_length=50, allow_blank=True, required=False)
    approved_by = serializers.CharField(max_length=50, allow_blank=True, required=False)
    
    class Meta:
        model = TenCycleSheet
        fields = [
            'id', 'employee', 'station', 'line', 'department', 'level', 'production_engineer_name',
            'qa_engineer_name', 'date', 'part_name', 'sop_no', 'checked_by',
            'verified_by', 'reviewed_by', 'approved_by', 'entries'
        ]
    
    def create(self, validated_data):
        entries_data = validated_data.pop('entries', [])
        sheet = TenCycleSheet.objects.create(**validated_data)
        
        for entry_data in entries_data:
            # --- MODIFIED LOGIC: Recalculate general_points_a on the server ---
            a_questions_passed = all([
                entry_data.get('a_q1', True),
                entry_data.get('a_q2', True),
                entry_data.get('a_q3', True),
                entry_data.get('a_q4', True),
                entry_data.get('a_q5', True),
            ])
            entry_data['general_points_a'] = a_questions_passed
            # --- END OF MODIFIED LOGIC ---
            
            TencycleEntrySheet.objects.create(sheet=sheet, **entry_data)
        
        return sheet
    
    def update(self, instance, validated_data):
        entries_data = validated_data.pop('entries', [])
        
        # Update the main sheet fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle entries update
        instance.entries.all().delete() # Clear existing entries before creating new ones
        for entry_data in entries_data:
            # --- MODIFIED LOGIC: Recalculate general_points_a on the server ---
            a_questions_passed = all([
                entry_data.get('a_q1', True),
                entry_data.get('a_q2', True),
                entry_data.get('a_q3', True),
                entry_data.get('a_q4', True),
                entry_data.get('a_q5', True),
            ])
            entry_data['general_points_a'] = a_questions_passed
            # --- END OF MODIFIED LOGIC ---
            
            TencycleEntrySheet.objects.create(sheet=instance, **entry_data)
        
        return instance

class TenCycleSheetDetailSerializer(serializers.ModelSerializer):
    entries = TencycleEntrySheetSerializer(many=True, read_only=True)
    
    # UPDATED: Use StringRelatedField to get the name from the related models' __str__ method.
    # This is cleaner and more robust than CharField(source='...').
    employee = serializers.StringRelatedField(read_only=True)
    station = serializers.StringRelatedField(read_only=True)
    line = serializers.StringRelatedField(read_only=True)
    department = serializers.StringRelatedField(read_only=True) 
    level = serializers.StringRelatedField(read_only=True) 
    
    class Meta:
        model = TenCycleSheet
        # Using the field names directly is fine now that they use StringRelatedField
        fields = [
            'id', 'employee', 'station', 'line',  'department', 'level', 
            'production_engineer_name', 'qa_engineer_name',
            'date', 'part_name', 'sop_no', 'checked_by', 
            'verified_by', 'reviewed_by', 'approved_by', 'entries'
        ]




class AnnualPlanSerializer(serializers.ModelSerializer):
    # For READING: Display nested employee details
    employee = MasterTableSerializer(read_only=True)
    
    # For WRITING: Accept an employee ID
    emp_id = serializers.PrimaryKeyRelatedField(
        queryset=MasterTable.objects.all(),
        source='employee',
        write_only=True
    )
    # To see the status display name (e.g., "Planned") instead of the value ("planned")
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # When retrieving a single detailed plan, we might want to see the sheet
    tencycle_sheet = TenCycleSheetSerializer(read_only=True)
    class Meta:
        model = AnnualPlan
        fields = [
            'id',
            'employee',          # Read-only nested object
            'emp_id',       # Write-only ID
            'supervisor_name',
            'plan_date',
            'status',
            'status_display',    # Read-only display name
            'tencycle_sheet',  # Read-only nested sheet for detail views
            'created_at',
        ]
        read_only_fields = ['status'] # Status should be controlled by the backend logic



# LEVEL 1 MCQ SERIALIZER 


from rest_framework import serializers
from .models import Question, Option # Import new models

# ... your existing serializers ...

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'option_text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    # This field will be used for both reading existing options
    # and accepting new options when creating a question.
    options = OptionSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'options', 'subtopiccontent']
        # Make subtopiccontent write-only in this context,
        # as it's needed for creation but not for display within the nested structure.
        extra_kwargs = {
            'subtopiccontent': {'write_only': True}
        }

    def create(self, validated_data):
        """
        This custom create method handles the nested options.
        """
        # Pop the nested options data from the validated data
        options_data = validated_data.pop('options')
        
        # Create the Question instance first
        question = Question.objects.create(**validated_data)
        
        # Now, loop through the options data and create each Option,
        # linking it to the question we just created.
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
            
        return question
    
    def update(self, instance, validated_data):
        # Update the question's text
        instance.question_text = validated_data.get('question_text', instance.question_text)
        instance.save()

        # Get the new options data
        options_data = validated_data.get('options')

        # Delete old options
        instance.options.all().delete()

        # Create new options
        for option_data in options_data:
            Option.objects.create(question=instance, **option_data)

        return instance



# ======================== Biometric Realtime ==========================

# Numax easytimepro start
from rest_framework import serializers
from .models import BioUser, BiometricDevice, BiometricEnrollment, Machine
from django.conf import settings

class BiometricDeviceSerializer(serializers.ModelSerializer):
    # READ: Show machine name if linked
    machine_name = serializers.CharField(source='machine_link.name', read_only=True, allow_null=True)

    # WRITE: Accept a single Machine ID (Integer)
    linked_machine_id = serializers.IntegerField(
        write_only=True, 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = BiometricDevice
        # We keep 'ip_address' and 'port' here so API can read them if needed, 
        # but Frontend can choose not to send them.
        fields = ['id', 'name', 'ip_address', 'port', 'serial_number', 'is_attendance_device','is_enrollment_device', 'machine_name', 'linked_machine_id']
        extra_kwargs = {
            'ip_address': {'required': False},
            'port': {'required': False}
        }

    def create(self, validated_data):
        machine_id = validated_data.pop('linked_machine_id', None)
        
        # Default port if not provided
        if 'port' not in validated_data:
            validated_data['port'] = 80  
            
        device = BiometricDevice.objects.create(**validated_data)
        
        if machine_id:
            try:
                machine = Machine.objects.get(id=machine_id)
                machine.biometric_device = device
                machine.save()
            except Machine.DoesNotExist:
                pass
        return device

    def update(self, instance, validated_data):
        machine_id = validated_data.pop('linked_machine_id', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # --- SAFE MACHINE LINKING LOGIC ---
        
        # 1. Get the CURRENTLY linked machine (if any)
        current_machine = None
        try:
            current_machine = instance.machine_link
        except Machine.DoesNotExist: # Handled safely
            current_machine = None

        # 2. Handle Unlink / Change
        if machine_id is None:
            # User wants to unlink (sent null)
            if current_machine:
                current_machine.biometric_device = None
                current_machine.save()
        
        else:
            # User wants to link to 'machine_id'
            
            # A. Check if we are changing link (Unlink old one)
            if current_machine and current_machine.id != machine_id:
                current_machine.biometric_device = None
                current_machine.save()
            
            # B. Link new machine
            try:
                new_machine = Machine.objects.get(id=machine_id)
                new_machine.biometric_device = instance
                new_machine.save()
            except Machine.DoesNotExist:
                pass # Invalid machine ID passed
                
        return instance

class BiometricEnrollmentSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)
    employee_name = serializers.CharField(source='bio_user.first_name', read_only=True)
    
    class Meta:
        model = BiometricEnrollment
        fields = ['id', 'bio_user', 'employee_name', 'device', 'device_name', 'synced_at']

        
from rest_framework import serializers
from .models import BioUser, BiometricEnrollment, BiometricDevice
from django.conf import settings

class BioUserSerializer(serializers.ModelSerializer):
    # New fields to track status
    enrolled_devices = serializers.SerializerMethodField()
    
    # Developer Mode Flag (Sent to frontend)
    dev_mode = serializers.SerializerMethodField()

    class Meta:
        model = BioUser
        fields = [
            'id', 'employeeid', 'first_name', 'last_name',
            'has_face', 'has_fingerprint', 
            'enrolled_devices', 'dev_mode'
        ]

    def get_enrolled_devices(self, obj):
        # Returns list of device names this user is synced to
        return [e.device.name for e in obj.enrollments.all()]

    def get_dev_mode(self, obj):
        # Reads from settings.py. If True, frontend enables all buttons.
        return getattr(settings, 'BIO_DEV_MODE', False)



from .models import OperatorDailyLog 
from django.utils import timezone # <--- 1. Import this

class OperatorDailyLogSerializer(serializers.ModelSerializer):
    employee_code = serializers.CharField(source='bio_user.employeeid', read_only=True)
    employee_name = serializers.CharField(source='bio_user.first_name', read_only=True)
    device_name = serializers.CharField(source='device.name', read_only=True)
    
    # Format times for Frontend (HH:MM)
    first_punch = serializers.SerializerMethodField()
    last_punch = serializers.SerializerMethodField()

    class Meta:
        model = OperatorDailyLog
        fields = ['id', 'employee_code', 'employee_name', 'device_name', 'first_punch', 'last_punch', 'date']

    def get_first_punch(self, obj):
        if obj.first_punch:
            # 2. CONVERT UTC -> LOCAL TIME
            local_dt = timezone.localtime(obj.first_punch)
            return local_dt.strftime('%H:%M')
        return "-"

    def get_last_punch(self, obj):
        if obj.last_punch:
            # 3. CONVERT UTC -> LOCAL TIME
            local_dt = timezone.localtime(obj.last_punch)
            return local_dt.strftime('%H:%M')
        return "-"

#Numax easytimepro end-----------------------



# #ESSL setuptime --

# from .models import BioUser

# class BioUserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BioUser
#         fields = '__all__'
        
# ======================== Biometric Realtime End ==========================



#================== BiometricAttendance ==================#

from rest_framework import serializers
from .models import BiometricAttendance

class BiometricAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiometricAttendance
        fields = '__all__'

from .models import SystemSettings

class SystemSettingsSerializer(serializers.ModelSerializer):
    processed_folder_path = serializers.ReadOnlyField()
    path_exists = serializers.SerializerMethodField()
    processed_folder_exists = serializers.SerializerMethodField()

    class Meta:
        model = SystemSettings
        fields = [
            'id', 
            'excel_source_path', 
            'processed_folder_path',
            'path_exists',
            'processed_folder_exists',
            'updated_at'
        ]

    def get_path_exists(self, obj):
        import os
        if obj.excel_source_path:
            return os.path.exists(obj.excel_source_path)
        return False

    def get_processed_folder_exists(self, obj):
        import os
        if obj.processed_folder_path:
            return os.path.exists(obj.processed_folder_path)
        return False

#================== BiometricAttendance End ==================#



# ============ for handover =============== 


class MasterTableHandoverDetailSerializer(serializers.ModelSerializer):
    """
    A dedicated serializer that provides the full, nested details needed
    ONLY for the Handover Modal. It is safe and isolated.
    """
    # These will now return nested objects {id, name} instead of just an ID
    department = DepartmentSerializer(read_only=True)
    current_line = LineSerializer(read_only=True)
    current_station = StationSerializer(read_only=True)

    class Meta:
        model = MasterTable
        # Add the new fields to the list
        fields = [
            'emp_id',
            'first_name',
            'last_name',
            'designation',
            'department',       # This will be the nested department object
            'current_line',     # This will be the nested line object
            'current_station',  # This will be the nested station object
            'date_of_joining',
            'birth_date',
            'sex',
            'email',
            'phone'
        ]

# =============== end ========================= 

# ======================== ACTION PLAN ================

# app/serializers.py
from rest_framework import serializers
from .models import ActionItem, ActionItemRejection

class ActionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionItem
        fields = ['id', 'topic', 'subtopic', 'date']



class ActionItemRejectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionItemRejection
        fields = ['id', 'topic', 'subtopic', 'date']


# ========================== END =======================




# ===========================OJT AND 10 CYCLE ===================================

class LevelDayRequirementSerializer(serializers.ModelSerializer):
    level = serializers.PrimaryKeyRelatedField(
        queryset=Level.objects.all(),
        # This will show/send the actual PK value → level_id
    )

    class Meta:
        model = LevelDayRequirement
        fields = ["id", "level", "required_days"]
        read_only_fields = ["created_at", "updated_at"]
        # Optional: show level name in response
        extra_kwargs = {
            "level": {"help_text": "The level_id of the Level (not auto-generated id)"}
        }

    # Optional: nicer representation with level name
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["level"] = {
            "level_id": instance.level.level_id,
            "level_name": instance.level.level_name
        }
        return ret





# ==========================================ojt status start ================================#
# serializers.py
from rest_framework import serializers
from django.db.models import Sum, Count, Max
from .models import (
    TraineeInfo, OJTScore, OJTTopic, OJTDay,
    OJTScoreRange, OJTPassingCriteria
)


class OJTStatusScoreSerializer(serializers.ModelSerializer):
    """One score row – only the fields the UI needs."""
    topic = serializers.SerializerMethodField()

    class Meta:
        model = OJTScore
        fields = ["day", "topic", "score"]

    def get_topic(self, obj):
        return {
            "id": obj.topic.id,
            "department": obj.topic.department.department_name,
            "level": obj.topic.level_id,
        }


class OJTStatusListSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source="station.station_name", read_only=True)
    level_name   = serializers.CharField(source="level.level_name",   read_only=True)
    scores_data  = OJTStatusScoreSerializer(source="scores", many=True, read_only=True)

    # ---- NEW FIELDS -------------------------------------------------
    calculated_status = serializers.SerializerMethodField()   # Complete / Incomplete
    calculated_result = serializers.SerializerMethodField()   # Pass / Fail / N/A
    category          = serializers.SerializerMethodField()   # Production / Quality

    class Meta:
        model = TraineeInfo
        fields = [
            "id", "trainee_name", "trainer_name", "emp_id",
            "line", "subline", "station_name", "process_name",
            "status", "level", "level_name", "scores_data",
            "calculated_status", "calculated_result", "category",
        ]

    # -----------------------------------------------------------------
    def get_category(self, obj):
            """
            Return the department name (e.g. “Assembly”, “QC”, …)
            instead of Production/Quality.
            """
            # `obj` is a TraineeInfo instance.
            # The first score (if any) tells us the department.
            first_score = obj.scores.first()
            if first_score and first_score.topic and first_score.topic.department:
                return first_score.topic.department.department_name
            # Fallback – if no scores yet, try to read from the trainee’s level
            if obj.level and hasattr(obj.level, 'department'):
                return obj.level.department.department_name
            return "Unknown"
    # -----------------------------------------------------------------
    def get_calculated_status(self, obj):
        return self._compute(obj)["status"]

    def get_calculated_result(self, obj):
        return self._compute(obj)["result"]

    # -----------------------------------------------------------------
    def _compute(self, trainee: TraineeInfo):
        """
        Core logic – runs once per trainee.
        Returns {"status": "...", "result": "..."}
        """
        scores_qs = trainee.scores.select_related(
            "topic__department", "topic__level", "day"
        )
        if not scores_qs.exists():
            return {"status": "Incomplete", "result": "N/A"}

        # -------------------------------------------------------------
        # 1. Department & Level (same for every score of a trainee)
        # -------------------------------------------------------------
        first = scores_qs.first()
        dept = first.topic.department
        lvl  = first.topic.level

        # -------------------------------------------------------------
        # 2. Required days for this dept+level
        # -------------------------------------------------------------
        required_days = list(
            OJTDay.objects.filter(department=dept, level=lvl)
            .values_list("id", flat=True)
            .distinct()
        )
        if not required_days:
            return {"status": "Incomplete", "result": "N/A"}

        # -------------------------------------------------------------
        # 3. Max score per topic (same for the whole dept+level)
        # -------------------------------------------------------------
        try:
            max_per_topic = OJTScoreRange.objects.get(department=dept, level=lvl).max_score
        except OJTScoreRange.DoesNotExist:
            max_per_topic = 10   # fallback – you can change it

        # -------------------------------------------------------------
        # 4. All topics that belong to this dept+level
        # -------------------------------------------------------------
        all_topics = list(
            OJTTopic.objects.filter(department=dept, level=lvl)
            .values_list("id", flat=True)
        )
        total_topics = len(all_topics)

        # -------------------------------------------------------------
        # 5. Walk through every required day
        # -------------------------------------------------------------
        all_days_complete = True
        all_days_full     = True   # every topic == max_per_topic

        for day_id in required_days:
            day_scores = scores_qs.filter(day_id=day_id)

            # ---- a) missing topics → incomplete day -----------------
            if day_scores.count() < total_topics:
                all_days_complete = False
                # we can break early if you want to short-circuit
                # continue

            # ---- b) sum of scores -----------------------------------
            total_score = day_scores.aggregate(s=Sum("score"))["s"] or 0
            max_possible = total_topics * max_per_topic
            percentage   = (total_score / max_possible) * 100 if max_possible else 0

            # ---- c) required % for this day -------------------------
            crit = (
                OJTPassingCriteria.objects.filter(department=dept, level=lvl, day_id=day_id).first()
                or OJTPassingCriteria.objects.filter(department=dept, level=lvl, day__isnull=True).first()
            )
            required_pct = crit.percentage if crit else 80

            if percentage < required_pct:
                all_days_full = False

            # ---- d) every single topic must be == max_per_topic -----
            # (this is the “full mark” rule you asked for)
            if day_scores.filter(score__lt=max_per_topic).exists():
                all_days_full = False

        # -------------------------------------------------------------
        # 6. Final decision
        # -------------------------------------------------------------
        status = "Complete" if all_days_complete else "Incomplete"
        result = (
            "N/A"
            if status == "Incomplete"
            else ("Pass" if all_days_full else "Fail")
        )
        return {"status": status, "result": result}
    


#=====================================ojt status end ===============================#



# serializers.py
class TenCycleStatusSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='employee.emp_id', read_only=True)
    
    # CORRECT WAY: Combine first_name + last_name
    employee_name = serializers.SerializerMethodField()

    department_name = serializers.CharField(source='department.department_name', read_only=True)
    station_name = serializers.CharField(source='station.station_name', read_only=True, allow_null=True)
    level_name = serializers.CharField(source='level.level_name', read_only=True)

    line = serializers.CharField(allow_null=True, read_only=True)
    operation_no = serializers.CharField(allow_null=True, read_only=True)
    passing_percentage = serializers.SerializerMethodField()

    class Meta:
        model = OperatorPerformanceEvaluation
        fields = [
            'id',
            'emp_id',
            'employee_name',        # ← Now works!
            'date',
            'shift',
            'department_name',
            'station_name',
            'level_name',
            'line',
            'operation_no',
            'final_percentage',
            'final_status',
            'is_completed',
            'date_of_retraining_completed',
            'passing_percentage',
            'created_at',
        ]

    # This method combines first_name and last_name
    def get_employee_name(self, obj):
        if not obj.employee:
            return "Unknown Employee"
        first = (obj.employee.first_name or "").strip()
        last = (obj.employee.last_name or "").strip()
        if first and last:
            return f"{first} {last}"
        elif first:
            return first
        elif last:
            return last
        else:
            return f"Employee {obj.employee.emp_id}"  # fallback

    def get_passing_percentage(self, obj):
        from .models import TenCyclePassingCriteria
        try:
            criteria = TenCyclePassingCriteria.objects.get(
                level=obj.level,
                department=obj.department,
                station=obj.station
            )
            return criteria.passing_percentage
        except TenCyclePassingCriteria.DoesNotExist:
            return 60.0
        

