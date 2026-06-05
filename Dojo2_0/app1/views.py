from tokenize import Comment
from django.conf import settings
from django.shortcuts import render
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# Create your views here.

from functools import cache
from django.shortcuts import get_list_or_404, render
from .serializers import CompanyLogoSerializer, KeyEventSerializer, MasterTableSerializer, RegisterSerializer, ScoreSerializer, SimpleScoreSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
#(2) Views for the User Login Views for the User Login
from django.shortcuts import get_list_or_404, render
from .serializers import RegisterSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
# #Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError
from .serializers import LoginSerializer

from django.shortcuts import render

# views.py
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError

from .serializers import LoginSerializer
from .models import User

def dojo_app(request):
    return render(request, 'index.html')


from django.contrib.auth import get_user_model, login
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("Login request data:", request.data)  # ok for debug, remove in production

        serializer = LoginSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            # return validation/auth errors
            return Response(
                {"message": "Authentication failed", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # serializer is valid -> get user by id
        user_id = serializer.validated_data.get('user_id')
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"message": "Authentication failed", "errors": "User not found"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Log user in (optional depending on token-only approach)
        login(request, user)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Build user payload safely (use getattr with defaults)
        user_payload = {
            'email': getattr(user, 'email', None),
            'first_name': getattr(user, 'first_name', None),
            'last_name': getattr(user, 'last_name', None),
            'employeeid': getattr(user, 'employeeid', None),
            # Prefer returning primitive values (ids or names) for related objects:
            'role': getattr(getattr(user, 'role', None), 'name', None),
            'hq': getattr(getattr(user, 'hq', None), 'name', getattr(user, 'hq', None)),
            'factory': getattr(getattr(user, 'factory', None), 'name', getattr(user, 'factory', None)),
            'department': getattr(getattr(user, 'department', None), 'name', getattr(user, 'department', None)),
            'status': getattr(user, 'status', None),
        }

        return Response({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': str(refresh),
            'user': user_payload
        }, status=status.HTTP_200_OK)





#(1) Views for the User Register

from django.db import IntegrityError
from django.shortcuts import render
from .serializers import RegisterSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import CompanyLogo, KeyEvent, MasterTable, Score, TestSession, User

class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request):
        user_data = request.data
        serializer = self.serializer_class(data=user_data)

        try:
            serializer.is_valid(raise_exception=True)

            # Check if user already exists by email
            if User.objects.filter(email=user_data.get("email")).exists():
                return Response({
                    "message": "Registration failed",
                    "errors": {"email": "This email is already registered."}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if employee ID already exists
            if User.objects.filter(employeeid=user_data.get("employeeid")).exists():
                return Response({
                    "message": "Registration failed",
                    "errors": {"employeeid": "This employee ID is already in use."}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Save the user
            serializer.save()

            return Response({
                "message": "User registered successfully!"
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            # Handle specific validation errors
            return Response({
                "message": "Validation failed",
                "errors": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError:
            # Handle database integrity errors (like duplicate entries)
            return Response({
                "message": "Database error",
                "errors": {"detail": "Duplicate entry or constraint violation."}
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Handle unexpected errors
            return Response({
                "message": "Unexpected error occurred",
                "errors": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from .models import User, Role
from .serializers import RegisterSerializer, RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related("role")
    serializer_class = RegisterSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [AllowAny()]  # registration allowed for unauthenticated
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Return current user info"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    def get_permissions(self):
        if self.action in ["create", "list"]:
            return [AllowAny()]  # Allow unauthenticated users to create and list roles
        return [IsAuthenticated()]


#(3) Views for the User Logout

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LogoutSerializer

class LogoutAPIView(APIView):
    """
    User Logout API View
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            refresh_token = serializer.validated_data["refresh_token"]

            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Blacklist the refresh token
                return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    





from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Hq, Factory, Department, Line, SubLine, Station
from .serializers import (
    HqSerializer, FactorySerializer, DepartmentSerializer,
    LineSerializer, SubLineSerializer, StationSerializer
)

class HqViewSet(viewsets.ModelViewSet):
    queryset = Hq.objects.all()
    serializer_class = HqSerializer
    
    def get_queryset(self):
        queryset = Hq.objects.all().order_by('hq_name')
        return queryset

class FactoryViewSet(viewsets.ModelViewSet):
    queryset = Factory.objects.all()
    serializer_class = FactorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hq']
    
    def get_queryset(self):
        queryset = Factory.objects.all().select_related('hq').order_by('factory_name')
        hq_id = self.request.query_params.get('hq', None)
        if hq_id is not None:
            queryset = queryset.filter(hq_id=hq_id)
        return queryset

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['factory', 'hq']
    
    def get_queryset(self):
        queryset = Department.objects.all().select_related('factory', 'hq').order_by('department_name')
        factory_id = self.request.query_params.get('factory', None)
        hq_id = self.request.query_params.get('hq', None)
        
        if factory_id is not None:
            queryset = queryset.filter(factory_id=factory_id)
        elif hq_id is not None:
            queryset = queryset.filter(hq_id=hq_id)
            
        return queryset

class LineViewSet(viewsets.ModelViewSet):
    queryset = Line.objects.all()
    serializer_class = LineSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department', 'factory', 'hq']
    
    def get_queryset(self):
        queryset = Line.objects.all().select_related('department', 'factory', 'hq').order_by('line_name')
        department_id = self.request.query_params.get('department', None)
        factory_id = self.request.query_params.get('factory', None)
        hq_id = self.request.query_params.get('hq', None)
        
        if department_id is not None:
            queryset = queryset.filter(department_id=department_id)
        elif factory_id is not None:
            queryset = queryset.filter(factory_id=factory_id)
        elif hq_id is not None:
            queryset = queryset.filter(hq_id=hq_id)
            
        return queryset

class SubLineViewSet(viewsets.ModelViewSet):
    queryset = SubLine.objects.all()
    serializer_class = SubLineSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['line', 'department', 'factory', 'hq']
    
    def get_queryset(self):
        queryset = SubLine.objects.all().select_related('line', 'department', 'factory', 'hq').order_by('subline_name')
        line_id = self.request.query_params.get('line', None)
        department_id = self.request.query_params.get('department', None)
        factory_id = self.request.query_params.get('factory', None)
        hq_id = self.request.query_params.get('hq', None)
        
        if line_id is not None:
            queryset = queryset.filter(line_id=line_id)
        elif department_id is not None:
            queryset = queryset.filter(department_id=department_id)
        elif factory_id is not None:
            queryset = queryset.filter(factory_id=factory_id)
        elif hq_id is not None:
            queryset = queryset.filter(hq_id=hq_id)
            
        return queryset

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subline', 'line', 'department', 'factory', 'hq']
    
    def get_queryset(self):
        queryset = Station.objects.all().select_related('subline', 'line', 'department', 'factory', 'hq').order_by('station_name')
        subline_id = self.request.query_params.get('subline', None)
        line_id = self.request.query_params.get('line', None)
        department_id = self.request.query_params.get('department', None)
        factory_id = self.request.query_params.get('factory', None)
        hq_id = self.request.query_params.get('hq', None)
        
        if subline_id is not None:
            queryset = queryset.filter(subline_id=subline_id)
        elif line_id is not None:
            queryset = queryset.filter(line_id=line_id)
        elif department_id is not None:
            queryset = queryset.filter(department_id=department_id)
        elif factory_id is not None:
            queryset = queryset.filter(factory_id=factory_id)
        elif hq_id is not None:
            queryset = queryset.filter(hq_id=hq_id)
            
        return queryset

# Add this to your views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import HierarchyStructure
from .serializers import HierarchyStructureSerializer

# views.py - Updated HierarchyStructureViewSet
from rest_framework.decorators import api_view

@api_view(['GET'])
def get_all_departments(request):
    departments = Department.objects.all()
    serializer = DepartmentReadSerializer(departments, many=True)
    return Response({
        'departments': serializer.data,
    }, status=status.HTTP_200_OK)



class HierarchyByDepartmentView(APIView):
    """
    Fetch hierarchy by department_id with flexible nesting:
    department → line → subline → station
    department → line → station
    department → subline → station
    department → station
    """

    def get(self, request, *args, **kwargs):
        department_id = request.query_params.get("department_id")
        if not department_id:
            return Response(
                {"error": "department_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            department_id = int(department_id)
            structures = HierarchyStructure.objects.filter(department_id=department_id)

            if not structures.exists():
                return Response(
                    {"error": f"No hierarchy found for department id {department_id}"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            department = structures.first().department
            department_data = {
                "department_id": department.department_id,
                "department_name": department.department_name,
                "lines": {},
                "sublines": {},
                "stations": {},
            }

            # build hierarchy flexibly
            for structure in structures:
                line = structure.line
                subline = structure.subline
                station = structure.station

                if line:  # if line exists
                    if line.line_id not in department_data["lines"]:
                        department_data["lines"][line.line_id] = {
                            "line_id": line.line_id,
                            "line_name": line.line_name,
                            "sublines": {},
                            "stations": {},
                        }

                    if subline:  # subline under line
                        if subline.subline_id not in department_data["lines"][line.line_id]["sublines"]:
                            department_data["lines"][line.line_id]["sublines"][subline.subline_id] = {
                                "subline_id": subline.subline_id,
                                "subline_name": subline.subline_name,
                                "stations": {},
                            }

                        if station:
                            department_data["lines"][line.line_id]["sublines"][subline.subline_id]["stations"][
                                station.station_id
                            ] = {
                                "station_id": station.station_id,
                                "station_name": station.station_name,
                            }
                    else:  # station directly under line
                        if station:
                            department_data["lines"][line.line_id]["stations"][station.station_id] = {
                                "station_id": station.station_id,
                                "station_name": station.station_name,
                            }

                elif subline:  # no line, but subline exists
                    if subline.subline_id not in department_data["sublines"]:
                        department_data["sublines"][subline.subline_id] = {
                            "subline_id": subline.subline_id,
                            "subline_name": subline.subline_name,
                            "stations": {},
                        }

                    if station:
                        department_data["sublines"][subline.subline_id]["stations"][station.station_id] = {
                            "station_id": station.station_id,
                            "station_name": station.station_name,
                        }

                elif station:  # no line, no subline → station directly under department
                    department_data["stations"][station.station_id] = {
                        "station_id": station.station_id,
                        "station_name": station.station_name,
                    }

            # convert dicts to lists
            department_data["lines"] = list(department_data["lines"].values())
            for line in department_data["lines"]:
                line["sublines"] = list(line["sublines"].values())
                line["stations"] = list(line["stations"].values())
                for subline in line["sublines"]:
                    subline["stations"] = list(subline["stations"].values())

            department_data["sublines"] = list(department_data["sublines"].values())
            for subline in department_data["sublines"]:
                subline["stations"] = list(subline["stations"].values())

            department_data["stations"] = list(department_data["stations"].values())

            return Response(department_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
from rest_framework.decorators import api_view 
from rest_framework.response import Response 
from .models import HierarchyStructure 
 
@api_view(['GET']) 
def get_hierarchy_structures(request): 
    structures = HierarchyStructure.objects.all() 
 
    merged_data = {} 
 
    for s in structures: 
        # key for grouping (structure_name + hq_id + factory_id) 
        key = (s.structure_name, s.hq.hq_id if s.hq else None, s.factory.factory_id if s.factory else None) 
 
        if key not in merged_data: 
            merged_data[key] = { 
                "structure_id": s.structure_id,  # you can choose the first id or min id 
                "structure_name": s.structure_name, 
                "hq": s.hq.hq_id if s.hq else None, 
                "hq_name": f"{s.hq.hq_name} (ID: {s.hq.hq_id})" if s.hq else None, 
                "factory": s.factory.factory_id if s.factory else None, 
                "factory_name": f"{s.factory.factory_name} (ID: {s.factory.factory_id})" if s.factory else None, 
                "structure_data": { 
                    "hq_name": s.hq.hq_name if s.hq else None, 
                    "factory_name": s.factory.factory_name if s.factory else None, 
                    "departments": [] 
                } 
            } 
 
        structure_data = merged_data[key]["structure_data"] 
 
        # Departments 
        if s.department: 
            dept_obj = next( 
                (d for d in structure_data["departments"] if d["id"] == s.department.department_id), 
                None 
            ) 
            if not dept_obj: 
                dept_obj = { 
                    "id": s.department.department_id, 
                    "department_name": s.department.department_name, 
                    "lines": [],
                    "stations": []  # Add stations array for departments
                } 
                structure_data["departments"].append(dept_obj) 
 
            # Handle stations directly under department (when no line/subline)
            if s.station and not s.line and not s.subline:
                if not any(st["id"] == s.station.station_id for st in dept_obj["stations"]):
                    dept_obj["stations"].append({
                        "id": s.station.station_id,
                        "station_name": s.station.station_name
                    })
 
            # Lines 
            if s.line: 
                line_obj = next( 
                    (l for l in dept_obj["lines"] if l["id"] == s.line.line_id), 
                    None 
                ) 
                if not line_obj: 
                    line_obj = { 
                        "id": s.line.line_id, 
                        "line_name": s.line.line_name, 
                        "sublines": [],
                        "stations": []  # Add stations array for lines
                    } 
                    dept_obj["lines"].append(line_obj) 
 
                # Handle stations directly under line (when no subline)
                if s.station and not s.subline:
                    if not any(st["id"] == s.station.station_id for st in line_obj["stations"]):
                        line_obj["stations"].append({
                            "id": s.station.station_id,
                            "station_name": s.station.station_name
                        })
 
                # Sublines 
                if s.subline: 
                    subline_obj = next( 
                        (sl for sl in line_obj["sublines"] if sl["id"] == s.subline.subline_id), 
                        None 
                    ) 
                    if not subline_obj: 
                        subline_obj = { 
                            "id": s.subline.subline_id, 
                            "subline_name": s.subline.subline_name, 
                            "stations": [] 
                        } 
                        line_obj["sublines"].append(subline_obj) 
 
                    # Stations under sublines
                    if s.station: 
                        if not any(st["id"] == s.station.station_id for st in subline_obj["stations"]): 
                            subline_obj["stations"].append({ 
                                "id": s.station.station_id, 
                                "station_name": s.station.station_name 
                            }) 
 
    # return merged list 
    return Response(list(merged_data.values()))




from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import HierarchyStructure
from .serializers import HierarchyStructureSerializer
import logging

logger = logging.getLogger(__name__)

class HierarchyStructureViewSet(viewsets.ModelViewSet):
    queryset = HierarchyStructure.objects.all().select_related(
        "hq", "factory", "department", "line", "subline", "station"
    )
    serializer_class = HierarchyStructureSerializer

    def create(self, request, *args, **kwargs):
        """Create hierarchy records from nested structure_data"""
        data = request.data
        print("📥 Incoming POST data:", data)

        structure_name = data.get('structure_name')
        structure_data = data.get('structure_data', {})
        hq_id = data.get('hq')
        factory_id = data.get('factory')

        if not structure_name:
            return Response({'error': 'structure_name is required'}, status=status.HTTP_400_BAD_REQUEST)

        return self._create_hierarchy_records(structure_name, structure_data, hq_id, factory_id)

    def update(self, request, *args, **kwargs):
        """Update hierarchy structure by deleting old and creating new records"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data
        
        print(f"📥 Incoming PUT data for structure_id {instance.structure_id}:", data)

        # Get the structure_name from the instance or data
        structure_name = data.get('structure_name', instance.structure_name)
        structure_data = data.get('structure_data', {})
        hq_id = data.get('hq', instance.hq_id if instance.hq else None)
        factory_id = data.get('factory', instance.factory_id if instance.factory else None)

        if 'structure_data' in data:
            # If structure_data is provided, delete old records and create new ones
            print(f"🔄 Updating hierarchy structure: {structure_name}")
            return self._create_hierarchy_records(structure_name, structure_data, hq_id, factory_id)
        else:
            # If no structure_data, do regular update
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

    def _create_hierarchy_records(self, structure_name, structure_data, hq_id, factory_id):
        """Helper method to create hierarchy records (used by both create and update)"""
        try:
            with transaction.atomic():
                # Delete existing records with the same structure_name
                deleted_count = HierarchyStructure.objects.filter(structure_name=structure_name).count()
                HierarchyStructure.objects.filter(structure_name=structure_name).delete()
                print(f"🗑 Deleted {deleted_count} existing records for structure: {structure_name}")

                created_records = []

                # Iterate over departments → lines → sublines → stations
                departments = structure_data.get('departments', [])
                for department in departments:
                    dept_id = department.get('id')
                    print(f"🏢 Processing department {dept_id}")

                    # ✅ Case 1: stations directly under department
                    dept_stations = department.get('stations', [])
                    if dept_stations:
                        print(f"📌 Found {len(dept_stations)} stations directly under department {dept_id}")
                        for station in dept_stations:
                            station_id = station.get('id')
                            print(f"💾 Creating record: dept={dept_id}, station={station_id}")
                            
                            try:
                                record = HierarchyStructure.objects.create(
                                    structure_name=structure_name,
                                    hq_id=hq_id,
                                    factory_id=factory_id,
                                    department_id=dept_id,
                                    line_id=None,
                                    subline_id=None,
                                    station_id=station_id
                                )
                                created_records.append(record)
                                print(f"✅ Successfully created record with ID: {record.structure_id}")
                                
                                # Verify the record was actually saved
                                verification = HierarchyStructure.objects.filter(structure_id=record.structure_id).first()
                                if verification:
                                    print(f"✅ Verification: Record {record.structure_id} exists in DB with station_id={verification.station_id}")
                                else:
                                    print(f"❌ Verification failed: Record {record.structure_id} not found in DB")
                                    
                            except Exception as create_error:
                                print(f"❌ Error creating record: {str(create_error)}")
                                raise create_error

                    # ✅ Case 2: lines processing
                    lines = department.get('lines', [])
                    for line in lines:
                        line_id = line.get('id')
                        
                        # ✅ Case 2a: stations directly under line
                        line_stations = line.get('stations', [])
                        if line_stations:
                            print(f"📌 Found {len(line_stations)} stations directly under line {line_id}")
                            for station in line_stations:
                                station_id = station.get('id')
                                print(f"💾 Creating record: dept={dept_id}, line={line_id}, station={station_id}")
                                
                                try:
                                    record = HierarchyStructure.objects.create(
                                        structure_name=structure_name,
                                        hq_id=hq_id,
                                        factory_id=factory_id,
                                        department_id=dept_id,
                                        line_id=line_id,
                                        subline_id=None,
                                        station_id=station_id
                                    )
                                    created_records.append(record)
                                    print(f"✅ Successfully created line-station record with ID: {record.structure_id}")
                                except Exception as create_error:
                                    print(f"❌ Error creating line-station record: {str(create_error)}")
                                    raise create_error

                        # ✅ Case 2b: sublines processing
                        sublines = line.get('sublines', [])
                        if not sublines:
                            # Create line-only record if no sublines and no stations
                            if not line_stations:
                                print(f"📌 Saving line {line_id} under department {dept_id}")
                                try:
                                    record = HierarchyStructure.objects.create(
                                        structure_name=structure_name,
                                        hq_id=hq_id,
                                        factory_id=factory_id,
                                        department_id=dept_id,
                                        line_id=line_id,
                                        subline_id=None,
                                        station_id=None
                                    )
                                    created_records.append(record)
                                except Exception as create_error:
                                    print(f"❌ Error creating line record: {str(create_error)}")
                                    raise create_error
                        else:
                            for subline in sublines:
                                subline_id = subline.get('id')
                                stations = subline.get('stations', [])

                                if not stations:
                                    # Create subline-only record if no stations
                                    print(f"📌 Saving subline {subline_id} under line {line_id}")
                                    try:
                                        record = HierarchyStructure.objects.create(
                                            structure_name=structure_name,
                                            hq_id=hq_id,
                                            factory_id=factory_id,
                                            department_id=dept_id,
                                            line_id=line_id,
                                            subline_id=subline_id,
                                            station_id=None
                                        )
                                        created_records.append(record)
                                    except Exception as create_error:
                                        print(f"❌ Error creating subline record: {str(create_error)}")
                                        raise create_error
                                else:
                                    for station in stations:
                                        station_id = station.get('id')
                                        print(f"📌 Saving station {station_id} under subline {subline_id}")
                                        try:
                                            record = HierarchyStructure.objects.create(
                                                structure_name=structure_name,
                                                hq_id=hq_id,
                                                factory_id=factory_id,
                                                department_id=dept_id,
                                                line_id=line_id,
                                                subline_id=subline_id,
                                                station_id=station_id
                                            )
                                            created_records.append(record)
                                        except Exception as create_error:
                                            print(f"❌ Error creating station record: {str(create_error)}")
                                            raise create_error

                print(f"🎯 Total created records: {len(created_records)}")
                
                # Double-check all records exist before serializing
                for record in created_records:
                    db_record = HierarchyStructure.objects.filter(structure_id=record.structure_id).first()
                    if not db_record:
                        raise Exception(f"Record {record.structure_id} not found in database after creation")

                # Serialize all created records
                serializer = self.get_serializer(created_records, many=True)
                print("✅ Created hierarchy records:", len(serializer.data))
                
                # Final verification before returning
                final_count = HierarchyStructure.objects.filter(structure_name=structure_name).count()
                print(f"🔍 Final count in DB for structure '{structure_name}': {final_count}")
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"❌ Exception occurred: {str(e)}")
            logger.error(f"Failed to create hierarchy structure: {str(e)}")
            return Response({'error': 'Failed to create hierarchy structure', 'details': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        """Return hierarchy records (including dept-level stations)"""
        queryset = self.filter_queryset(self.get_queryset())

        # Show:
        #   - Full hierarchy (dept + line + subline + station)
        #   - Dept + station (when no line/subline exist)
        #   - Line + station (when no subline exist)
        queryset = queryset.filter(
            station__isnull=False,
            department__isnull=False
        )

        # Unique structures
        seen_structures = set()
        unique_structures = []
        for record in queryset:
            if record.structure_name not in seen_structures:
                unique_structures.append(record)
                seen_structures.add(record.structure_name)

        serializer = self.get_serializer(unique_structures, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        """Filter queryset based on query params"""
        queryset = super().get_queryset()
        for field in ['hq', 'factory', 'department', 'line', 'subline', 'station', 'structure_name']:
            value = self.request.query_params.get(field)
            if value:
                queryset = queryset.filter({f"{field}_id" if field != 'structure_name' else field: value})
        return queryset

    def _find_first_station(self, structure_data):
        """Helper to find first station in nested data"""
        departments = structure_data.get('departments', [])
        for department in departments:
            dept_id = department.get('id')

            # Handle case: station directly under department
            for station in department.get('stations', []):
                return {'department_id': dept_id, 'line_id': None,
                        'subline_id': None, 'station_id': station.get('id')}

            # Handle case: station directly under line
            for line in department.get('lines', []):
                line_id = line.get('id')
                for station in line.get('stations', []):
                    return {'department_id': dept_id, 'line_id': line_id,
                            'subline_id': None, 'station_id': station.get('id')}

                # Normal flow: line → subline → station
                for subline in line.get('sublines', []):
                    subline_id = subline.get('id')
                    stations = subline.get('stations', [])
                    if stations:
                        station_id = stations[0].get('id')
                        return {'department_id': dept_id, 'line_id': line_id,
                                'subline_id': subline_id, 'station_id': station_id}
        return None


from rest_framework.decorators import action

# ------------------ Mastertable Views ------------------
import pandas as pd
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser ,JSONParser
from io import BytesIO
import json
from datetime import datetime
from .models import MasterTable, Department
from .serializers import MasterTableSerializer

class MasterTableViewSet(viewsets.ModelViewSet):
    queryset = MasterTable.objects.all()
    serializer_class = MasterTableSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=False, methods=['get'])
    def download_template(self, request):
        """Download Excel template with headers only"""
        try:
            # Create DataFrame with column headers matching the model fields
            headers = [
                'emp_id',
                'first_name', 
                'last_name',
                'department_name',  # We'll use department name in template
                'designation',
                'date_of_joining',
                'birth_date',
                'sex',
                'email',
                'phone'
            ]
            
            # Create empty DataFrame with headers
            df = pd.DataFrame(columns=headers)
            
            # Add example row to show format
            example_row = {
                'emp_id': 'EMP001',
                'first_name': 'John',
                'last_name': 'Doe',
                'department_name': 'IT Department',
                'designation' : 'IT',
                'date_of_joining': '2024-01-15',
                'birth_date': '1990-05-20',
                'sex': 'M',
                'email': 'john.doe@company.com',
                'phone': '+1234567890'
            }
            
            # Add example row and then clear it (keeps formatting)
            df.loc[0] = example_row
            df = df.iloc[0:0]  # Remove the example row, keep structure
            
            # Create Excel file in memory
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Employee Template', index=False)
                
                # Get the workbook and worksheet
                workbook = writer.book
                worksheet = writer.sheets['Employee Template']
                
                # Add instructions in a separate sheet
                instructions_df = pd.DataFrame({
                    'Instructions': [
                '1. Fill in employee details in the Employee Template sheet.',
                '2. The following fields are MANDATORY: emp_id, first_name, date_of_joining.',
                '3. All other fields are optional and can be left blank.',
                '',
                '--- Field Details ---',
                'emp_id: Must be unique (e.g., EMP001, EMP002) [MANDATORY]',
                'first_name: Employee\'s first name [MANDATORY]',
                'date_of_joining: Format YYYY-MM-DD (e.g., 2024-01-15) OR DD-MM-YYYY [MANDATORY]',
                'last_name: Employee\'s last name (optional)',
                'department_name: Exact department name, case sensitive (optional)',
                'birth_date: Format YYYY-MM-DD (optional)',
                'sex: M for Male, F for Female, O for Other (optional)',
                'email: Must be a unique and valid email format (optional)',
                'phone: Include country code, e.g., +1234567890 (optional)',
                '',
                '--- Available Departments ---'
                    ]
                })
                
                # Add available departments to instructions
                departments = Department.objects.all().values_list('department_name', flat=True)
                for dept in departments:
                    instructions_df = pd.concat([
                        instructions_df,
                        pd.DataFrame({'Instructions': [f'- {dept}']})
                    ], ignore_index=True)
                
                instructions_df.to_excel(writer, sheet_name='Instructions', index=False)
            
            output.seek(0)
            
            # Create response
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename=employee_template.xlsx'
            
            return response
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate template: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

    @action(detail=False, methods=['post'])
    def upload_excel(self, request):
        """
        Upload Excel file and create or update employee records.
        Mandatory fields: emp_id, first_name, date_of_joining.
        """
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        if not file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'Invalid file format. Please upload an Excel file (.xlsx or .xls)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use a converter to read all data as strings initially to avoid pandas type inference issues
            df = pd.read_excel(file, sheet_name='Employee Template', dtype=str)
            # Replace numpy's NaN representation with empty strings for consistency
            df = df.fillna('')
            
            # --- CHANGE 1: Define the mandatory columns for the Excel header ---
            required_columns = ['emp_id', 'first_name', 'date_of_joining']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return Response(
                    {'error': f'The Excel template is missing required columns: {", ".join(missing_columns)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if df.empty:
                return Response(
                    {'error': 'The file is empty or contains no data rows.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            created_employees = []
            updated_employees = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # --- CHANGE 2: Add row-level validation for mandatory fields ---
                    # This checks if the data for mandatory fields is present in each row.
                    mandatory_fields_data = ['emp_id', 'first_name', 'date_of_joining']
                    missing_data_fields = []
                    for field in mandatory_fields_data:
                        # Check if the field is empty or just whitespace
                        if not row.get(field) or str(row.get(field)).strip() == '':
                            missing_data_fields.append(field)

                    # If any mandatory data is missing, log an error and skip this row.
                    if missing_data_fields:
                        # Provide a helpful error message even if emp_id is missing
                        emp_id_for_error = str(row.get('emp_id', 'N/A')).strip() or 'N/A'
                        errors.append({
                            'row': index + 2,  # +2 accounts for 0-based index and the header row
                            'emp_id': emp_id_for_error,
                            'error': f'Missing mandatory data for: {", ".join(missing_data_fields)}'
                        })
                        continue  # Move to the next row

                    # --- Data processing starts here only if mandatory fields are present ---
                    department = None
                    department_name = str(row.get('department_name', '')).strip()
                    if department_name:
                        try:
                            department = Department.objects.get(department_name=department_name)
                        except Department.DoesNotExist:
                            errors.append({
                                'row': index + 2,
                                'emp_id': str(row['emp_id']).strip(),
                                'error': f'Department "{department_name}" not found'
                            })
                            continue
                    
                    emp_id = str(row['emp_id']).strip()
                    
                    # Prepare data dictionary. Optional fields can be empty.
                    employee_data = {
                        'emp_id': emp_id,
                        'first_name': str(row['first_name']).strip(),
                        'last_name': str(row.get('last_name', '')).strip(),
                        'designation': str(row.get('designation', '')).strip(),
                        'department': department, 
                        'email': str(row.get('email', '')).strip().lower(),
                        'date_of_joining': pd.to_datetime(row['date_of_joining']).date(),
                        'birth_date': pd.to_datetime(row['birth_date']).date() if str(row.get('birth_date', '')).strip() else None,
                        'sex': str(row.get('sex', '')).strip().upper(),
                        'phone': str(row.get('phone', '')).strip(),
                    }
                    
                    # Additional validation for optional fields if they are provided
                    if employee_data['sex'] and employee_data['sex'] not in ['M', 'F', 'O']:
                        errors.append({
                            'row': index + 2, 'emp_id': emp_id,
                            'error': f'Invalid sex value "{employee_data["sex"]}". Use M, F, or O.'
                        })
                        continue
                    
                    # Check for existing employee to either update or create
                    try:
                        employee, created = MasterTable.objects.get_or_create(
                            emp_id=emp_id,
                            defaults=employee_data
                        )
                        
                        if created:
                            created_employees.append({
                                'emp_id': employee.emp_id,
                                'name': f"{employee.first_name} {employee.last_name}".strip(),
                                'email': employee.email
                            })
                        else:
                            # Logic to update only blank fields
                            updated_fields = []
                            for field, new_val in employee_data.items():
                                old_val = getattr(employee, field, None)
                                # Special check for department FK
                                if field == 'department':
                                    old_val = getattr(employee, 'department_id', None)

                                # Update if the old value is empty/None and the new value is not
                                is_old_val_empty = old_val in [None, '']
                                is_new_val_provided = new_val not in [None, '']
                                if is_old_val_empty and is_new_val_provided:
                                    setattr(employee, field, new_val)
                                    updated_fields.append(field)

                            if updated_fields:
                                employee.save(update_fields=updated_fields)
                                updated_employees.append({
                                    'emp_id': employee.emp_id,
                                    'name': f"{employee.first_name} {employee.last_name}".strip(),
                                    'email': employee.email
                                })

                    except Exception as db_error:
                        # This will catch integrity errors from the DB (e.g., unique email constraint)
                        errors.append({
                            'row': index + 2,
                            'emp_id': emp_id,
                            'error': f"Database error: {str(db_error)}"
                        })

                except Exception as e:
                    # Catch any other unexpected errors during row processing (e.g., bad date format)
                    errors.append({
                        'row': index + 2,
                        'emp_id': str(row.get('emp_id', 'N/A')).strip(),
                        'error': f"An unexpected error occurred: {str(e)}"
                    })
            
            response_data = {
                'message': f'Upload completed. {len(created_employees)} employees created, {len(updated_employees)} employees updated.',
                'created_count': len(created_employees),
                'updated_count': len(updated_employees),
                'error_count': len(errors),
                'created_employees': created_employees,
                'updated_employees': updated_employees
            }
            
            if errors:
                response_data['errors'] = errors
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': f'Failed to process file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


        
    @action(detail=False, methods=['get'], url_path='by-employee-code/(?P<emp_id>[^/.]+)')
    def retrieve_by_employee_code(self, request, emp_id=None):
        try:
           employee = MasterTable.objects.get(emp_id=emp_id)
           serializer = self.get_serializer(employee)
           return Response(serializer.data)
        except MasterTable.DoesNotExist:
           return Response({"error": "Employee not found"}, status=404)



# Level 0

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from .models import UserRegistration,HumanBodyQuestions,HumanBodyCheckSession,HumanBodyCheckSheet
from .serializers import UserRegistrationSerializer,UserWithBodyCheckSerializer,HumanBodyCheckSessionSerializer,HumanBodyQuestionsSerializer

from rest_framework import filters
# class UserRegistrationViewSet(viewsets.ModelViewSet):
#     queryset = UserRegistration.objects.all()
#     serializer_class = UserRegistrationSerializer
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['first_name', 'last_name', 'email', 'phone_number']
#     parser_classes = [MultiPartParser, FormParser, JSONParser]
#     lookup_field = 'temp_id'
    
#     def get_serializer_class(self):
#         if self.request.method in ['PATCH', 'PUT']:
#             return UserUpdateSerializer
#         return UserRegistrationSerializer




class UserRegistrationViewSet(viewsets.ModelViewSet):
    queryset = UserRegistration.objects.all().order_by('-created_at')
    # Use the same serializer for all actions (create, list, update, etc.)
    serializer_class = UserRegistrationSerializer 
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone_number', 'temp_id']
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'temp_id'




class HumanBodyQuestionsViewSet(viewsets.ModelViewSet):
    queryset = HumanBodyQuestions.objects.all()
    serializer_class = HumanBodyQuestionsSerializer

    @action(detail=False, methods=['post'])
    def add_question(self, request):
        
        question_text = request.data.get('question_text', '').strip()
        if not question_text:
            return Response({"error": "question_text is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        question, created = HumanBodyQuestions.objects.get_or_create(
            question_text=question_text,
        )
        
        if created:
            serializer = self.get_serializer(question)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Question already exists"}, status=status.HTTP_400_BAD_REQUEST)


class BodyCheckSubmissionView(APIView):
    def get(self, request):
        
        temp_id = request.query_params.get('temp_id')
        if temp_id:
            
            try:
                user = UserRegistration.objects.get(temp_id=temp_id)
                
                session = HumanBodyCheckSession.objects.filter(user=user).order_by('-created_at').first()
                if not session:
                    
                    session = HumanBodyCheckSession.objects.filter(temp_id=temp_id).order_by('-created_at').first()
            except UserRegistration.DoesNotExist:
                
                session = HumanBodyCheckSession.objects.filter(temp_id=temp_id).order_by('-created_at').first()
            
            if session:
                serializer = HumanBodyCheckSessionSerializer(session)
                return Response([serializer.data])
            return Response([])
        
        
        sessions = HumanBodyCheckSession.objects.all()
        serializer = HumanBodyCheckSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        
        temp_id = request.data.get('temp_id')
        check_data = request.data.get('checkData', {})
        
        if not temp_id:
            return Response({"error": "temp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserRegistration.objects.get(temp_id=temp_id)
            
            
            existing_session = HumanBodyCheckSession.objects.filter(user=user).first()
            if existing_session:
                return Response(
                    {"error": "Body check already exists for this user"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            
            existing_temp_session = HumanBodyCheckSession.objects.filter(temp_id=temp_id).first()
            if existing_temp_session:
                return Response(
                    {"error": "Body check already exists for this user"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            
            session = HumanBodyCheckSession.objects.create(temp_id=temp_id, user=user)
            
           
            for item_id, item_data in check_data.items():
                description = item_data.get('description', '')
                answer = item_data.get('status', 'pending')
                
                if description and answer != '':
                   
                    question, created = HumanBodyQuestions.objects.get_or_create(
                        question_text=description
                    )
                    
                   
                    HumanBodyCheckSheet.objects.create(
                        session=session,
                        question=question,
                        answer=answer
                    )
            
            serializer = HumanBodyCheckSessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except UserRegistration.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        

def update_or_create_answers(session, check_data):
    """
    Helper function to delete old answers (if any) and create new ones for a given session.
    """
    # 1. Delete all old answers associated with this session. This makes updates simple.
    session.sheet_answers.all().delete()

    # 2. Loop through the new check_data and create the new answers.
    for item_id, item_data in check_data.items():
        description = item_data.get('description', '')
        answer = item_data.get('status', '') # Use empty string for better matching
        
        # Only process items that have a description and a status
        if description and answer:
            # Get or create the question itself
            question, created = HumanBodyQuestions.objects.get_or_create(
                question_text=description
            )
            
            # Create the link between the session, question, and answer
            HumanBodyCheckSheet.objects.create(
                session=session,
                question=question,
                answer=answer
            )

class BodyCheckDetailView(APIView):
    def get_object(self, temp_id):
        try:
            return HumanBodyCheckSession.objects.filter(temp_id=temp_id).latest('created_at')
        except HumanBodyCheckSession.DoesNotExist:
            return None

    def get(self, request, temp_id):
        session = self.get_object(temp_id)
        if session:
            serializer = HumanBodyCheckSessionSerializer(session)
            return Response([serializer.data])
        return Response([])

    def put(self, request, temp_id):
        session = self.get_object(temp_id)
        if not session:
            return Response({"error": "Session not found to update."}, status=status.HTTP_404_NOT_FOUND)

        check_data = request.data.get('checkData', {})

        # --- UPDATED TO USE THE UTILITY FUNCTION ---
        # This is now much cleaner and will work correctly.
        update_or_create_answers(session, check_data)
        
        serializer = HumanBodyCheckSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, temp_id):
        session = self.get_object(temp_id)
        if not session:
            return Response({"error": "Session not found to delete."}, status=status.HTTP_404_NOT_FOUND)
        
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserBodyCheckListView(APIView):
    
    def get(self, request):
        users = UserRegistration.objects.all()
        serializer = UserWithBodyCheckSerializer(users, many=True)
        return Response(serializer.data)
    
    def patch(self, request):
        """Mark user as added to master table"""
        temp_id = request.data.get('temp_id')
        
        if not temp_id:
            return Response({"error": "temp_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserRegistration.objects.get(temp_id=temp_id)
            
            # Check if user has passed status
            latest_session = HumanBodyCheckSession.objects.filter(user=user).order_by('-created_at').first()
            if not latest_session:
                latest_session = HumanBodyCheckSession.objects.filter(temp_id=temp_id).order_by('-created_at').first()
            
            if not latest_session or latest_session.overall_status != 'pass':
                return Response(
                    {"error": "User must have passed status to be added to master table"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if user.is_added_to_master:
                return Response(
                    {"error": "User already added to master table"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from django.utils import timezone
            user.is_added_to_master = True
            user.added_to_master_at = timezone.now()
            user.save()
            
            # Return updated user list
            users = UserRegistration.objects.all()
            serializer = UserWithBodyCheckSerializer(users, many=True)
            return Response(serializer.data)
            
        except UserRegistration.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)




# views.py
from rest_framework import viewsets
from .models import (
    Level, Days, SubTopic, SubTopicContent, TrainingContent, Evaluation
)
from .serializers import ( LevelSerializer, DaysSerializer,DaysWriteSerializer, 
     SubTopicListSerializer, SubTopicAdminSerializer, SubTopicSerializer, SubTopicContentSerializer,
    TrainingContentSerializer, EvaluationSerializer
)

def _int_or_none(v):
    try:
        return int(str(v).strip("/"))
    except (TypeError, ValueError):
        return None


class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer


class DaysViewSet(viewsets.ModelViewSet):
    queryset = Days.objects.all().select_related("level")
    # serializer_class = DaysSerializer

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return DaysWriteSerializer
        return DaysSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        level = _int_or_none(self.request.query_params.get("level"))
        if level is not None:
            qs = qs.filter(level__level_id=level)
        return qs


from rest_framework import viewsets
from .models import Level, Days, SubTopic, SubTopicContent, TrainingContent, Evaluation
from .serializers import (
    LevelSerializer, DaysSerializer,
    SubTopicSerializer, SubTopicListSerializer, SubTopicAdminSerializer,
    SubTopicContentSerializer, TrainingContentSerializer, EvaluationSerializer
)

class SubTopicViewSet(viewsets.ModelViewSet):
    queryset = SubTopic.objects.all().select_related("days", "level")
      
    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return SubTopicListSerializer  # read shape for frontend
        return SubTopicAdminSerializer  # subtopic_name, days, level
     
    def get_queryset(self):
        qs = super().get_queryset()
        level = self.request.query_params.get("level")   # /subtopics/?level=1
        days_id = self.request.query_params.get("days")  # /subtopics/?days=3
        
        if level is not None:
            qs = qs.filter(level__level_id=level)
        if days_id is not None:
            qs = qs.filter(days__days_id=days_id)
        return qs
    queryset = SubTopic.objects.all()
    serializer_class = SubTopicSerializer


class SubTopicContentViewSet(viewsets.ModelViewSet):
    queryset = SubTopicContent.objects.all()
    serializer_class = SubTopicContentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        subtopic = self.request.query_params.get("subtopic")  # /subtopic-contents/?subtopic=12
        if subtopic is not None:
            qs = qs.filter(subtopic__subtopic_id=subtopic)
        return qs
    
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    

from rest_framework import viewsets, parsers


class TrainingContentViewSet(viewsets.ModelViewSet):
    queryset = TrainingContent.objects.all()
    serializer_class = TrainingContentSerializer

    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    # def get_queryset(self):
    #     qs = super().get_queryset()
    #     stc = self.request.query_params.get("subtopiccontent")  # /training-contents/?subtopiccontent=55
    #     if stc:
    #         qs = qs.filter(subtopiccontent__subtopiccontent_id=stc)
    #     return qs

    def get_queryset(self):
        qs = super().get_queryset()
        # stc = self.request.query_params.get("subtopiccontent") or self.request.query_params.get("subtopic_content")
        stc = _int_or_none(self.request.query_params.get("subtopiccontent") or self.request.query_params.get("subtopic_content"))
        # if stc is not None:
        #     try:
        #         stc = int(str(stc).strip("/"))
        #         qs = qs.filter(subtopiccontent__subtopiccontent_id=stc)
        #     except ValueError:
        #         pass
        # return qs
        if stc is not None:
            qs = qs.filter(subtopiccontent__subtopiccontent_id=stc)
        return qs


    def get_serializer_context(self):
        # so training_file returns absolute URL
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import ProductionPlan
from .serializers import ProductionPlanSerializer

class ProductionPlanViewSet(viewsets.ModelViewSet):
    queryset = ProductionPlan.objects.all()
    serializer_class = ProductionPlanSerializer

    def create(self, request, *args, **kwargs):
        # Handle bulk creation
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_bulk_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return super().create(request, *args, **kwargs)

    def perform_bulk_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        # Filtering based on new structure
        hq = params.get('hq')
        factory = params.get('factory')
        department = params.get('department')
        line = params.get('line')
        subline = params.get('subline')
        station = params.get('station')
        year = params.get('year')
        month = params.get('month')

        if hq:
            queryset = queryset.filter(hq_id=hq)
        if factory:
            queryset = queryset.filter(factory_id=factory)
        if department:
            queryset = queryset.filter(department_id=department)
        if line:
            queryset = queryset.filter(line_id=line)
        if subline:
            queryset = queryset.filter(subline_id=subline)
        if station:
            queryset = queryset.filter(station_id=station)
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)

        return queryset


from rest_framework import viewsets
from .models import QuestionPaper
from .serializers import QuestionPaperSerializer

# class QuestionPaperViewSet(viewsets.ModelViewSet):
#     queryset = QuestionPaper.objects.all().order_by("-created_at")
#     serializer_class = QuestionPaperSerializer

#     @action(detail=True, methods=["get"])
#     def questions(self, request, pk=None):
#         # Get the paper
#         paper = self.get_object()
#         paper_serializer = QuestionPaperSerializer(paper)

#         # Get related questions
#         questions = TemplateQuestion.objects.filter(question_paper_id=pk)
#         question_serializer = TemplateQuestionSerializer(questions, many=True)

#         # Return combined response
#         return Response({
#             "question_paper": paper_serializer.data,
#             "questions": question_serializer.data
#         })

# your_app/views.py

# New, correct import
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend # <-- IMPORT

from .models import QuestionPaper, TemplateQuestion
from .serializers import QuestionPaperSerializer, TemplateQuestionSerializer
from .filters import QuestionPaperFilter # <-- IMPORT YOUR NEW FILTER



class QuestionPaperViewSet(viewsets.ModelViewSet):
    # queryset = QuestionPaper.objects.all().order_by("-created_at") # We'll improve this
    serializer_class = QuestionPaperSerializer
    
    # --- ADD THESE TWO LINES ---
    filter_backends = [DjangoFilterBackend]
    filterset_class = QuestionPaperFilter
    # ---------------------------

    def get_queryset(self):
        """
        Optimizing the queryset by pre-fetching related objects.
        This prevents N+1 query problems and makes your API much faster.
        """
        return QuestionPaper.objects.select_related(
            'department', 'line', 'subline', 'station', 'level'
        ).order_by("-created_at")

    @action(detail=True, methods=["get"])
    def questions(self, request, pk=None):
        paper = self.get_object()
        paper_serializer = self.get_serializer(paper) # Use get_serializer for context

        questions = TemplateQuestion.objects.filter(question_paper_id=pk)
        question_serializer = TemplateQuestionSerializer(questions, many=True)

        return Response({
            "question_paper": paper_serializer.data,
            "questions": question_serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # If validation fails, print the errors to the console
            print("--- VALIDATION ERRORS ---")
            print(serializer.errors)
            print("--- REQUEST DATA ---")
            print(request.data)
            print("-------------------------")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # If validation succeeds, continue with the normal creation process
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    

    @action(detail=True, methods=['get'])
    def applicable_stations(self, request, pk=None):
        """
        For a given question paper, returns a list of all stations it applies to.
        """
        try:
            paper = self.get_object()
        except QuestionPaper.DoesNotExist:
            return Response({"error": "Question paper not found"}, status=status.HTTP_404_NOT_FOUND)

        # Case 1: Paper is assigned to a specific Station
        if paper.station:
            queryset = Station.objects.filter(pk=paper.station.pk)

        # Case 2: Paper is assigned to a SubLine (applies to all stations under it)
        elif paper.subline:
            queryset = Station.objects.filter(subline=paper.subline)

        # Case 3: Paper is assigned to a Line (applies to all stations under it)
        elif paper.line:
            # We need to find all sublines for this line, then all stations for those sublines
            queryset = Station.objects.filter(subline__line=paper.line)

        # Case 4: Paper is assigned to a Department (applies to all stations under it)
        elif paper.department:
            # This is your "bruhh" scenario. Find all stations under the department.
            queryset = Station.objects.filter(subline__line__department=paper.department)

        # Case 5: Paper has no assignment (should not happen with good validation)
        else:
            queryset = Station.objects.none()

        # Serialize the results and return them
        # Assuming you have a StationSerializer
        serializer = StationSerializer(queryset.order_by('station_name'), many=True)
        return Response(serializer.data)


from rest_framework import viewsets
from .models import StationLevelQuestionPaper
from .serializers import StationLevelQuestionPaperSerializer


class StationLevelQuestionPaperViewSet(viewsets.ModelViewSet):
    queryset = StationLevelQuestionPaper.objects.all()
    serializer_class = StationLevelQuestionPaperSerializer





# import io
# import pandas as pd
# from django.http import HttpResponse
# from django.core.exceptions import ValidationError as DjangoValidationError
# from django.shortcuts import get_object_or_404
# from rest_framework import status, viewsets
# from rest_framework.decorators import action
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.response import Response
# from rest_framework.exceptions import ValidationError as DRFValidationError

# from .models import TemplateQuestion, QuestionPaper
# from .serializers import TemplateQuestionSerializer
# from openpyxl.utils import get_column_letter
# from openpyxl.styles import Font, Alignment
# from openpyxl import load_workbook

# class TemplateQuestionViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing Template Questions, including bulk upload & download template.
#     """
#     queryset = TemplateQuestion.objects.all()
#     serializer_class = TemplateQuestionSerializer
#     parser_classes = [MultiPartParser, FormParser]

 
#     @action(detail=False, methods=['get'], url_path='download-template')
#     def download_template(self, request, *args, **kwargs):
#         """
#         Generates and serves an Excel template with Department → Line → Subline → Station → Level header
#         fetched from QuestionPaper instance.
#         """
#         # Get question_paper_id from query params
#         question_paper_id = request.query_params.get('question_paper_id')
        
#         if not question_paper_id:
#             return Response(
#                 {'detail': 'question_paper_id is required as a query parameter.'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             question_paper_id = int(question_paper_id)
#         except (ValueError, TypeError):
#             return Response(
#                 {'detail': 'Invalid question_paper_id format.'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Fetch QuestionPaper with related fields
#         try:
#             question_paper = get_object_or_404(
#                 QuestionPaper.objects.select_related(
#                     'department', 'line', 'subline', 'station', 'level'
#                 ),
#                 question_paper_id=question_paper_id
#             )
#         except Exception as e:
#             return Response(
#                 {'detail': f'QuestionPaper not found: {str(e)}'}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         # Example static sample data (for demo)
#         sample_data = [
#             {
#                 "question": "What is the capital of France?",
#                 "option_a": "Paris",
#                 "option_b": "London",
#                 "option_c": "Berlin",
#                 "option_d": "Madrid",
#                 "correct_answer": "Paris",
#             },
#             {
#                 "question": "Which planet is known as the Red Planet?",
#                 "option_a": "Earth",
#                 "option_b": "Venus",
#                 "option_c": "Mars",
#                 "option_d": "Jupiter",
#                 "correct_answer": "Mars",
#             },
#         ]

#         df = pd.DataFrame(sample_data)

#         # Write DataFrame to memory
#         buffer = io.BytesIO()
#         with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
#             df.to_excel(writer, index=False, sheet_name="Template_Questions")

#         buffer.seek(0)

#         # Load workbook for header insertion
#         wb = load_workbook(buffer)
#         ws = wb["Template_Questions"]

#         # === Fetch header fields from QuestionPaper instance ===
#         department = str(question_paper.department)
#         line = str(question_paper.line)
#         subline = str(question_paper.subline)
#         station = str(question_paper.station)
#         level = str(question_paper.level)

#         # Build header text
#         header_text = (
#             f"Department: {department} | Line: {line} | Subline: {subline} | "
#             f"Station: {station} | Level: {level}"
#         )
       

#         # Insert header row above the question table
#         ws.insert_rows(1, amount=2)  # make space for header
#         ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=ws.max_column)
#         cell = ws.cell(row=1, column=1, value=header_text)
#         cell.font = Font(bold=True, size=12)
#         cell.alignment = Alignment(horizontal="center")

#         # Adjust column widths
#         for col in range(1, ws.max_column + 1):
#             col_letter = get_column_letter(col)
#             ws.column_dimensions[col_letter].width = 25

#         # Save final Excel
#         final_buffer = io.BytesIO()
#         wb.save(final_buffer)
#         final_buffer.seek(0)

#         # Include question paper name in filename for better identification
#         filename = f"Template_Questions_{question_paper.question_paper_name.replace(' ', '_')}.xlsx"

#         response = HttpResponse(
#             final_buffer.getvalue(),
#             content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
#         )
#         response["Content-Disposition"] = f'attachment; filename="{filename}"'

#         return response


#     @action(detail=False, methods=['post'], url_path='bulk-upload')
#     def bulk_upload(self, request, *args, **kwargs):
#         """
#         Handles bulk creation of Template Questions from an Excel file.
#         """
#         file_obj = request.FILES.get('file')
#         question_paper_id = request.data.get('question_paper_id')

#         if not question_paper_id:
#             return Response({'detail': 'question_paper_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

#         if not file_obj:
#             return Response({'detail': 'No file was uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             question_paper_id = int(question_paper_id)
#         except (ValueError, TypeError):
#             return Response({'detail': 'Invalid question_paper_id format.'}, status=status.HTTP_400_BAD_REQUEST)
        
#         # Verify that the QuestionPaper exists using its actual primary key field name
#         try:
#             # Using .pk is robust, but using the specific field name is also fine
#             question_paper = get_object_or_404(QuestionPaper, pk=question_paper_id)
#         except Exception as e:
#             return Response(
#                 {'detail': f'QuestionPaper not found: {str(e)}'}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         try:
#             # Assuming the template has a header, skip first 2 rows. 
#             # header=2 means the 3rd row is the header.
#             df = pd.read_excel(file_obj, sheet_name='Template_Questions', header=2, engine='openpyxl')
#             df = df.where(pd.notnull(df), None)
#             df.dropna(subset=['question'], inplace=True)
#         except Exception as e:
#             return Response(
#                 {'detail': f"Error reading the Excel file. Ensure it contains a sheet named 'Template_Questions'. Error: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         required_columns = {
#             'question', 'option_a', 'option_b', 'option_c',
#             'option_d', 'correct_answer'
#         }
        
#         if not required_columns.issubset(df.columns):
#             missing_cols = required_columns - set(df.columns)
#             return Response({'detail': f'File is missing required columns: {", ".join(missing_cols)}'}, status=status.HTTP_400_BAD_REQUEST)

#         questions_to_create = []
#         errors = []

#         for index, row in df.iterrows():
#             row_data = row.to_dict()
            
#             # === THE FIX IS HERE ===
#             # Use the correct primary key of the question_paper object
#             # Using .pk is the best practice as it works regardless of the field's name
#             row_data['question_paper'] = question_paper.pk 
            
#             serializer = self.get_serializer(data=row_data)
            
#             try:
#                 serializer.is_valid(raise_exception=True)
#                 questions_to_create.append(serializer.validated_data)
#             except (DRFValidationError, DjangoValidationError) as e:
#                 excel_row_number = index + 4 # 2 header rows + 1 table header row + 1 for 0-index
#                 error_detail = serializer.errors if hasattr(serializer, 'errors') and serializer.errors else str(e)
#                 errors.append({'row': excel_row_number, 'errors': error_detail})
        
#         if errors:
#             return Response({
#                 'status': 'Upload failed due to validation errors.',
#                 'created_count': 0,
#                 'error_count': len(errors),
#                 'errors': errors
#             }, status=status.HTTP_400_BAD_REQUEST)

#         if questions_to_create:
#             model_instances = [TemplateQuestion(**data) for data in questions_to_create]
#             TemplateQuestion.objects.bulk_create(model_instances)

#         response_data = {
#             'status': 'Upload successful.',
#             'created_count': len(questions_to_create),
#             'error_count': len(errors),
#         }

#         return Response(response_data, status=status.HTTP_201_CREATED)
   

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         question_paper_id = self.request.query_params.get("question_paper")
#         if question_paper_id:
#             queryset = queryset.filter(question_paper_id=question_paper_id)
#         return queryset




# import io
# import pandas as pd
# from django.http import HttpResponse
# from django.core.exceptions import ValidationError as DjangoValidationError
# from django.shortcuts import get_object_or_404
# from rest_framework import status, viewsets
# from rest_framework.decorators import action
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.response import Response
# from rest_framework.exceptions import ValidationError as DRFValidationError

# from .models import TemplateQuestion, QuestionPaper
# from .serializers import TemplateQuestionSerializer
# from openpyxl.utils import get_column_letter
# from openpyxl.styles import Font, Alignment
# from openpyxl import load_workbook

# class TemplateQuestionViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing Template Questions, including bulk upload & download template.
#     """
#     queryset = TemplateQuestion.objects.all()
#     serializer_class = TemplateQuestionSerializer
#     parser_classes = [MultiPartParser, FormParser]

#     @action(detail=False, methods=['get'], url_path='download-template')
#     def download_template(self, request, *args, **kwargs):
#         """
#         Generates and serves an Excel template with image support.
#         """
#         question_paper_id = request.query_params.get('question_paper_id')
        
#         if not question_paper_id:
#             return Response(
#                 {'detail': 'question_paper_id is required as a query parameter.'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             question_paper_id = int(question_paper_id)
#         except (ValueError, TypeError):
#             return Response(
#                 {'detail': 'Invalid question_paper_id format.'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             question_paper = get_object_or_404(
#                 QuestionPaper.objects.select_related(
#                     'department', 'line', 'subline', 'station', 'level'
#                 ),
#                 pk=question_paper_id
#             )
#         except Exception as e:
#             return Response(
#                 {'detail': f'QuestionPaper not found: {str(e)}'}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         # Enhanced sample data with image placeholders
#         sample_data = [
#             {
#                 "question": "Identify the fruit in the image:",
#                 "option_a": "Apple",
#                 "option_a_image": "[IMAGE: Upload apple image here]",
#                 "option_b": "Orange",
#                 "option_b_image": "[IMAGE: Upload orange image here]",
#                 "option_c": "Banana",
#                 "option_c_image": "[IMAGE: Upload banana image here]",
#                 "option_d": "Grape",
#                 "option_d_image": "[IMAGE: Upload grape image here]",
#                 "correct_answer": "Apple",
#                 "question_image": "[IMAGE: Upload question image here (optional)]"
#             },
#             {
#                 "question": "What is the capital of France?",
#                 "option_a": "Paris",
#                 "option_a_image": "",
#                 "option_b": "London",
#                 "option_b_image": "",
#                 "option_c": "Berlin",
#                 "option_c_image": "",
#                 "option_d": "Madrid",
#                 "option_d_image": "",
#                 "correct_answer": "Paris",
#                 "question_image": ""
#             },
#         ]

#         df = pd.DataFrame(sample_data)

#         # Write DataFrame to memory
#         buffer = io.BytesIO()
#         with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
#             df.to_excel(writer, index=False, sheet_name="Template_Questions")

#         buffer.seek(0)

#         # Load workbook for header insertion
#         wb = load_workbook(buffer)
#         ws = wb["Template_Questions"]

#         # Fetch header fields from QuestionPaper instance
#         department = str(question_paper.department)
#         line = str(question_paper.line)
#         subline = str(question_paper.subline)
#         station = str(question_paper.station)
#         level = str(question_paper.level)

#         # Build header text
#         header_text = (
#             f"Department: {department} | Line: {line} | Subline: {subline} | "
#             f"Station: {station} | Level: {level}"
#         )

#         # Insert instructions for image upload
#         instructions = [
#             "INSTRUCTIONS FOR IMAGE UPLOAD:",
#             "1. For image options, leave the text field empty and add the image in the corresponding image column",
#             "2. Supported formats: JPG, PNG, GIF (max 2MB per image)",
#             "3. Images will be stored in the 'question_images/' directory",
#             "4. Correct answer should match the text option (A, B, C, D) even for image questions",
#             "",
#             "COLUMNS:",
#             "- question: Text question (optional if question_image is provided)",
#             "- question_image: Optional image for the question",
#             "- option_[a-d]: Text for each option (can be empty if image is provided)",
#             "- option_[a-d]_image: Image for each option (can be empty if text is provided)",
#             "- correct_answer: Must match one of the option texts (A, B, C, or D)"
#         ]

#         # Insert rows for instructions and header
#         ws.insert_rows(1, amount=len(instructions) + 2)
        
#         # Add instructions
#         for i, instruction in enumerate(instructions, 1):
#             cell = ws.cell(row=i, column=1, value=instruction)
#             cell.font = Font(bold=True if i <= 2 else False, italic=True, size=10)
#             ws.merge_cells(start_row=i, start_column=1, end_row=i, end_column=ws.max_column)
        
#         # Add main header
#         header_row = len(instructions) + 1
#         header_cell = ws.cell(row=header_row, column=1, value=header_text)
#         header_cell.font = Font(bold=True, size=12)
#         header_cell.alignment = Alignment(horizontal="center")
#         ws.merge_cells(
#             start_row=header_row, 
#             start_column=1, 
#             end_row=header_row, 
#             end_column=ws.max_column
#         )

#         # Adjust column widths
#         column_widths = {
#             'A': 40,  # question
#             'B': 15,  # option_a
#             'C': 20,  # option_a_image
#             'D': 15,  # option_b
#             'E': 20,  # option_b_image
#             'F': 15,  # option_c
#             'G': 20,  # option_c_image
#             'H': 15,  # option_d
#             'I': 20,  # option_d_image
#             'J': 15,  # correct_answer
#             'K': 25   # question_image
#         }
        
#         for col_letter, width in column_widths.items():
#             ws.column_dimensions[col_letter].width = width

#         # Update column headers to be more descriptive
#         header_row = len(instructions) + 2  # Row after instructions and main header
#         headers = {
#             'A': 'Question',
#             'B': 'Option A',
#             'C': 'Option A Image',
#             'D': 'Option B',
#             'E': 'Option B Image',
#             'F': 'Option C',
#             'G': 'Option C Image',
#             'H': 'Option D',
#             'I': 'Option D Image',
#             'J': 'Correct Answer',
#             'K': 'Question Image'
#         }
        
#         for col, header in headers.items():
#             cell = ws[f'{col}{header_row + 1}']  # DataFrame headers are one row below
#             cell.value = header
#             cell.font = Font(bold=True)
#             cell.alignment = Alignment(horizontal="center")

#         # Save final Excel
#         final_buffer = io.BytesIO()
#         wb.save(final_buffer)
#         final_buffer.seek(0)

#         filename = f"Template_Questions_{question_paper.question_paper_name.replace(' ', '_')}.xlsx"

#         response = HttpResponse(
#             final_buffer.getvalue(),
#             content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
#         )
#         response["Content-Disposition"] = f'attachment; filename="{filename}"'

#         return response
    


#     @action(detail=False, methods=['post'], url_path='bulk-upload')
#     def bulk_upload(self, request, *args, **kwargs):
#         """
#         Handles bulk creation with embedded Excel images.
#         Images are extracted directly from Excel cells.
#         """
#         file_obj = request.FILES.get('file')
#         question_paper_id = request.data.get('question_paper_id')

#         # Validate inputs
#         if not question_paper_id:
#             return Response({'detail': 'question_paper_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

#         if not file_obj:
#             return Response({'detail': 'No file was uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

#         if not file_obj.name.endswith('.xlsx'):
#             return Response({'detail': 'Only .xlsx files are supported.'}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             question_paper_id = int(question_paper_id)
#             question_paper = get_object_or_404(QuestionPaper, pk=question_paper_id)
#         except (ValueError, TypeError):
#             return Response({'detail': 'Invalid question_paper_id format.'}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response({'detail': f'QuestionPaper not found: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)
        
#         # Load workbook with openpyxl to extract images
#         try:
#             wb = load_workbook(file_obj, data_only=False)
#             ws = wb.active
            
#             # Extract all embedded images from Excel
#             excel_images = self._extract_images_from_excel(ws)
#             print(f"DEBUG: Extracted {len(excel_images)} images from Excel")
#             for img_info in excel_images:
#                 print(f"  - Image at row {img_info['row']}, col {img_info['col']}, format: {img_info.get('format', 'unknown')}")
#         except Exception as e:
#             return Response(
#                 {'detail': f'Error reading Excel file: {str(e)}'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Reset file pointer for pandas
#         file_obj.seek(0)
        
#         instructions = [
#             "INSTRUCTIONS FOR BULK UPLOAD WITH IMAGES:",
#             "1. You can type text directly in option columns (A, B, C, D)",
#             "2. OR insert images directly in the *_image columns (right-click → Insert → Pictures)",
#             "3. To insert image: Right-click on cell → Insert → Pictures → Choose image from computer",
#             "4. Images will be automatically extracted and saved when you upload this file",
#             "5. You can mix text and image options in the same question",
#             "6. Correct answer must match the TEXT of one of the options (even for image questions)",
#             "",
#             "COLUMNS EXPLANATION:",
#             "- question: Your question text (required)",
#             "- option_a/b/c/d: Text for the option (required if no image)",
#             "- option_a/b/c/d_image: Insert image here OR leave as text (optional)",
#             "- correct_answer: Must match option_a, option_b, option_c, or option_d text",
#             "- question_image: Insert question image here (optional)",
#             "",
#             "NOTE: Images are embedded in Excel - no separate image files needed!",
#             "",
#             "Sample row:",
#             "question,option_a,option_a_image,option_b,option_b_image,option_c,option_c_image,option_d,option_d_image,correct_answer,question_image",
#             "What is 2+2?,4,,2,,3,,1,,4,"
#         ]
        
#         # Try reading with expected header row, fallback to dynamic detection
#         try:
#             header_row = len(instructions) + 2
#             df = pd.read_excel(file_obj, sheet_name=0, header=header_row, engine='openpyxl')
#             print(f"DEBUG: Attempted to read Excel with header_row={header_row}")
#         except ValueError:
#             print("DEBUG: Falling back to dynamic header detection due to ValueError")
#             file_obj.seek(0)
#             df_temp = pd.read_excel(file_obj, sheet_name=0, header=None, engine='openpyxl')
#             header_row = None
#             for i, row in df_temp.iterrows():
#                 if 'question' in [str(x).lower() for x in row.values if pd.notnull(x)]:
#                     header_row = i
#                     break
#             if header_row is None:
#                 return Response(
#                     {'detail': "Could not find header row with 'question' column."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             file_obj.seek(0)
#             df = pd.read_excel(file_obj, sheet_name=0, header=header_row, engine='openpyxl')
#             print(f"DEBUG: Found header row at index {header_row}")

#         # Debug: Print column names
#         print("DEBUG: DataFrame columns:", df.columns.tolist())
        
#         # Apply column mapping (case-insensitive)
#         column_mapping = {
#             'question': 'question',
#             'Question': 'question',
#             'QUESTION': 'question',
#             'option a': 'option_a',
#             'Option A': 'option_a',
#             'OPTION A': 'option_a',
#             'option a image': 'option_a_image',
#             'Option A Image': 'option_a_image',
#             'OPTION A IMAGE': 'option_a_image',
#             'option b': 'option_b',
#             'Option B': 'option_b',
#             'OPTION B': 'option_b',
#             'option b image': 'option_b_image',
#             'Option B Image': 'option_b_image',
#             'OPTION B IMAGE': 'option_b_image',
#             'option c': 'option_c',
#             'Option C': 'option_c',
#             'OPTION C': 'option_c',
#             'option c image': 'option_c_image',
#             'Option C Image': 'option_c_image',
#             'OPTION C IMAGE': 'option_c_image',
#             'option d': 'option_d',
#             'Option D': 'option_d',
#             'OPTION D': 'option_d',
#             'option d image': 'option_d_image',
#             'Option D Image': 'option_d_image',
#             'OPTION D IMAGE': 'option_d_image',
#             'correct answer': 'correct_answer',
#             'Correct Answer': 'correct_answer',
#             'CORRECT ANSWER': 'correct_answer',
#             'question image': 'question_image',
#             'Question Image': 'question_image',
#             'QUESTION IMAGE': 'question_image'
#         }
        
#         # Rename columns case-insensitively
#         df.columns = [column_mapping.get(col, col) for col in df.columns]
#         print("DEBUG: DataFrame columns after renaming:", df.columns.tolist())
        
#         # Check if 'question' column exists
#         if 'question' not in df.columns:
#             return Response(
#                 {
#                     'detail': f"Excel file is missing the 'question' column. Found columns: {df.columns.tolist()}",
#                     'available_columns': df.columns.tolist()
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         df = df.where(pd.notnull(df), None)
#         df.dropna(subset=['question'], inplace=True)
        
#         # Column name to letter mapping (for image extraction)
#         column_letters = {
#             'option_a_image': 'C',
#             'option_b_image': 'E',
#             'option_c_image': 'G',
#             'option_d_image': 'I',
#             'question_image': 'K'
#         }

#         questions_to_create = []
#         errors = []

#         for index, row in df.iterrows():
#             row_data = row.to_dict()
#             excel_row_number = index + header_row + 2  # Adjust for header rows
#             actual_excel_row = excel_row_number  # Actual row in Excel (1-indexed)
            
#             row_data['question_paper'] = question_paper
            
#             # Extract images for this row
#             row_images = {}
            
#             for field_name, col_letter in column_letters.items():
#                 # Find images in this cell
#                 cell_images = [
#                     img for img in excel_images 
#                     if img['row'] == actual_excel_row and img['col'] == col_letter
#                 ]
                
#                 if cell_images:
#                     # Use the first image found in this cell
#                     img_data = cell_images[0]
#                     row_images[field_name] = img_data['image']
#                     print(f"DEBUG: Found image for row {excel_row_number}, field {field_name}")
            
#             # Remove image column data (we'll use extracted images instead)
#             for field_name in column_letters.keys():
#                 row_data.pop(field_name, None)
            
#             # Validate text fields
#             text_options = [
#                 row_data.get('option_a'),
#                 row_data.get('option_b'),
#                 row_data.get('option_c'),
#                 row_data.get('option_d')
#             ]
            
#             correct_answer = row_data.get('correct_answer')
#             if correct_answer and correct_answer not in text_options:
#                 errors.append({
#                     'row': excel_row_number,
#                     'errors': {'correct_answer': f"Correct answer '{correct_answer}' must match one of the text options: {text_options}"}
#                 })
#                 continue
            
#             # Attach images
#             if row_images:
#                 row_data['_images'] = row_images
            
#             questions_to_create.append(row_data)

#         if errors:
#             return Response({
#                 'status': 'Upload failed due to validation errors.',
#                 'created_count': 0,
#                 'error_count': len(errors),
#                 'errors': errors
#             }, status=status.HTTP_400_BAD_REQUEST)

#         # Create questions with images
#         created_count = 0
#         creation_errors = []
        
#         for data in questions_to_create:
#             try:
#                 images = data.pop('_images', {})
                
#                 # Create instance
#                 instance = TemplateQuestion.objects.create(**data)
                
#                 # Save images
#                 if images:
#                     self._save_excel_images_to_instance(instance, images)
                
#                 created_count += 1
#                 print(f"DEBUG: Successfully saved question {instance.id}")
                
#             except Exception as e:
#                 print(f"DEBUG ERROR: Failed to save question: {str(e)}")
#                 traceback.print_exc()
#                 creation_errors.append({'row': 'N/A', 'errors': f"Failed to save: {str(e)}"})

#         response_data = {
#             'status': 'Upload successful.' if created_count > 0 else 'Upload failed.',
#             'created_count': created_count,
#             'error_count': len(creation_errors),
#             'errors': creation_errors if creation_errors else None
#         }
        
#         status_code = status.HTTP_201_CREATED if created_count > 0 else status.HTTP_400_BAD_REQUEST
#         return Response(response_data, status=status_code)

#     def _extract_images_from_excel(self, worksheet):
#         """
#         Extract all embedded images from Excel worksheet.
#         Returns list of dicts with image data and cell location.
#         """
#         images = []
        
#         if not hasattr(worksheet, '_images'):
#             return images
        
#         for image in worksheet._images:
#             try:
#                 # Get image data
#                 img_data = image._data()
                
#                 # Get anchor position (which cell the image is in)
#                 if hasattr(image, 'anchor'):
#                     anchor = image.anchor
                    
#                     # Get cell reference from anchor
#                     if hasattr(anchor, '_from'):
#                         from_marker = anchor._from
#                         row = from_marker.row + 1  # openpyxl uses 0-indexed rows
#                         col = get_column_letter(from_marker.col + 1)  # Convert to letter
                        
#                         images.append({
#                             'image': img_data,
#                             'row': row,
#                             'col': col,
#                             'format': image.format if hasattr(image, 'format') else 'png'
#                         })
                        
#             except Exception as e:
#                 print(f"DEBUG: Error extracting image: {str(e)}")
#                 continue
        
#         return images

#     def _save_excel_images_to_instance(self, instance, images):
#         """Save extracted Excel images to Django model instance."""
#         image_updated = False
        
#         for field_name, img_data in images.items():
#             try:
#                 # Determine file extension
#                 img_format = 'png'  # default
#                 try:
#                     img_pil = PILImage.open(io.BytesIO(img_data))
#                     img_format = img_pil.format.lower()
#                 except:
#                     pass
                
#                 # Create filename
#                 filename = f"question_{int(time.time())}_{hashlib.md5(str(img_data[:100]).encode()).hexdigest()[:8]}.{img_format}"
                
#                 # Create ContentFile
#                 file_obj = ContentFile(img_data, name=filename)
                
#                 # Save to field
#                 field = getattr(instance, field_name)
#                 field.save(filename, file_obj, save=False)
#                 image_updated = True
                
#                 print(f"DEBUG: Saved {field_name} - {filename}")
                
#             except Exception as e:
#                 print(f"DEBUG ERROR: Failed to save {field_name}: {str(e)}")
        
#         if image_updated:
#             instance.save()
#             print(f"DEBUG: Instance {instance.id} saved with embedded images")

    
#     def create(self, request, *args, **kwargs):
#         """Override create to handle direct file uploads"""
#         print("=" * 50)
#         print("CREATE METHOD CALLED")
#         print(f"request.data keys: {list(request.data.keys())}")
#         print(f"request.FILES keys: {list(request.FILES.keys())}")
#         print("=" * 50)
        
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         # Perform the create
#         instance = serializer.save()
#         print(f"Instance created with ID: {instance.id}")
        
#         # Handle direct file uploads from request.FILES
#         self._handle_file_uploads(request, instance)
        
#         # Refresh the instance to get updated data
#         instance.refresh_from_db()
        
#         # Re-serialize to get the updated data with image URLs
#         serializer = self.get_serializer(instance)
#         headers = self.get_success_headers(serializer.data)
        
#         return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

#     def update(self, request, *args, **kwargs):
#         """Override update to handle direct file uploads"""
#         print("=" * 50)
#         print("UPDATE METHOD CALLED")
#         print(f"request.data keys: {list(request.data.keys())}")
#         print(f"request.FILES keys: {list(request.FILES.keys())}")
#         print("=" * 50)
        
#         partial = kwargs.pop('partial', False)
#         instance = self.get_object()
        
#         print(f"Updating instance ID: {instance.id}")
#         print(f"Current question_image: {instance.question_image.name if instance.question_image else 'None'}")
        
#         serializer = self.get_serializer(instance, data=request.data, partial=partial)
#         serializer.is_valid(raise_exception=True)
        
#         # Perform the update
#         instance = serializer.save()
#         print(f"After serializer.save() - question_image: {instance.question_image.name if instance.question_image else 'None'}")
        
#         # Handle direct file uploads from request.FILES
#         self._handle_file_uploads(request, instance)
        
#         # Refresh the instance to get updated data
#         instance.refresh_from_db()
#         print(f"After refresh - question_image: {instance.question_image.name if instance.question_image else 'None'}")
        
#         # Re-serialize to get the updated data with image URLs
#         serializer = self.get_serializer(instance)
        
#         return Response(serializer.data)

#     def _handle_file_uploads(self, request, instance):
#         """Handle direct image file uploads from request.FILES"""
#         image_fields = [
#             'question_image',
#             'option_a_image',
#             'option_b_image',
#             'option_c_image',
#             'option_d_image'
#         ]
        
#         print("\n_handle_file_uploads called")
#         print(f"Available FILES: {list(request.FILES.keys())}")
        
#         updated = False
#         for field_name in image_fields:
#             if field_name in request.FILES:
#                 file_obj = request.FILES[field_name]
#                 print(f"Processing {field_name}: {file_obj.name} ({file_obj.size} bytes)")
                
#                 try:
#                     # Get the field from the instance
#                     field = getattr(instance, field_name)
                    
#                     # Delete old file if it exists
#                     if field:
#                         old_file_path = field.path
#                         print(f"  Old file exists: {old_file_path}")
#                         try:
#                             if os.path.exists(old_file_path):
#                                 os.remove(old_file_path)
#                                 print(f"  Deleted old file")
#                         except Exception as e:
#                             print(f"  Could not delete old file: {e}")
                    
#                     # Save new file using the proper method
#                     field.save(file_obj.name, file_obj, save=False)
#                     updated = True
                    
#                     print(f"  ✓ Saved {field_name} - {file_obj.name}")
                    
#                 except Exception as e:
#                     print(f"  ✗ ERROR saving {field_name}: {str(e)}")
#                     import traceback
#                     traceback.print_exc()
#             else:
#                 print(f"{field_name}: Not in request.FILES")
        
#         # Save instance if any files were uploaded
#         if updated:
#             instance.save()
#             print(f"✓ Instance {instance.id} saved with images")
            
#             # Verify the save worked
#             instance.refresh_from_db()
#             print(f"Verification after save:")
#             for field_name in image_fields:
#                 field = getattr(instance, field_name)
#                 if field:
#                     print(f"  {field_name}: {field.name}")
#         else:
#             print("No files were uploaded to save")
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         question_paper_id = self.request.query_params.get("question_paper")
#         if question_paper_id:
#             queryset = queryset.filter(question_paper_id=question_paper_id)
#         return queryset




import io
import os
import traceback
import hashlib
import pandas as pd
from PIL import Image as PILImage
from datetime import datetime as dt  # Avoid conflict with time module

from django.conf import settings
from django.core.files.base import ContentFile
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from openpyxl import load_workbook
from openpyxl.utils import get_column_letter
from openpyxl.styles import Font, Alignment

# Import your models and serializers
from .models import TemplateQuestion, QuestionPaper
from .serializers import TemplateQuestionSerializer

class TemplateQuestionViewSet(viewsets.ModelViewSet):
    """
    Complete ViewSet for managing Template Questions with bulk upload/download support
    """
    queryset = TemplateQuestion.objects.all()
    serializer_class = TemplateQuestionSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = super().get_queryset()
        question_paper_id = self.request.query_params.get("question_paper")
        if question_paper_id:
            queryset = queryset.filter(question_paper_id=question_paper_id)
        return queryset

    @action(detail=False, methods=['get'], url_path='download-template')
    def download_template(self, request, *args, **kwargs):
        """
        Generates and serves an Excel template with image placeholders and instructions
        """
        question_paper_id = request.query_params.get('question_paper_id')
        if not question_paper_id:
            return Response({'detail': 'question_paper_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        question_paper = get_object_or_404(QuestionPaper, pk=question_paper_id)

        # Sample data with proper column names
        sample_data = [{
            "Question": "Sample question text",
            "Option A": "Option 1", "Option A Image": "",
            "Option B": "Option 2", "Option B Image": "",
            "Option C": "Option 3", "Option C Image": "",
            "Option D": "Option 4", "Option D Image": "",
            "Correct Answer": "Option 2",
            "Question Image": ""
        }]

        df = pd.DataFrame(sample_data)
        buffer = io.BytesIO()

        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Questions", startrow=15)

        buffer.seek(0)
        wb = load_workbook(buffer)
        ws = wb.active

        # Add instructions and formatting
        ws.merge_cells('A1:K1')
        ws['A1'] = f"TEMPLATE FOR: {question_paper.question_paper_name}"
        ws['A1'].font = Font(bold=True, size=14)

        instructions = [
            "INSTRUCTIONS:",
            "1. Do NOT rename or delete any columns",
            "2. Correct Answer must match one of the option texts exactly",
            "3. To add images: Right-click cell → Insert → Pictures → This Device",
            "4. Resize images to fit within cell boundaries",
            "5. You can mix text and images (leave text empty if using image)",
            "6. Save this file before uploading"
        ]

        for i, text in enumerate(instructions, 2):
            ws.cell(row=i, column=1, value=text).font = Font(italic=True)

        # Set column widths
        column_widths = {
            'A': 40, 'B': 15, 'C': 25, 'D': 15, 'E': 25,
            'F': 15, 'G': 25, 'H': 15, 'I': 25, 'J': 15, 'K': 25
        }
        for col, width in column_widths.items():
            ws.column_dimensions[col].width = width

        final_buffer = io.BytesIO()
        wb.save(final_buffer)
        final_buffer.seek(0)

        filename = f"Template_{question_paper.question_paper_name.replace(' ', '_')}.xlsx"
        response = HttpResponse(
            final_buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request, *args, **kwargs):
        """
        Uploads Excel file. Expects both Text AND Embedded Images.
        """
        file_obj = request.FILES.get('file')
        question_paper_id = request.data.get('question_paper_id')

        # 1. Basic Validation
        if not file_obj or not question_paper_id:
            return Response({'detail': 'File and Question Paper ID are required.'}, status=400)

        try:
            question_paper = get_object_or_404(QuestionPaper, pk=question_paper_id)
        except:
            return Response({'detail': 'Invalid Question Paper ID.'}, status=400)

        try:
            # 2. Extract Images first (Using OpenPyXL)
            wb = load_workbook(file_obj, data_only=False)
            ws = wb.active
            excel_images = self._extract_images_from_excel(ws)

            # 3. Find the Header Row dynamically
            header_row = None
            for i, row in enumerate(ws.iter_rows(values_only=True), 1):
                # Convert row to list of lowercase strings to search
                row_str = [str(c).lower().strip() for c in row if c]
                if 'question' in row_str:
                    header_row = i
                    break
            
            if not header_row:
                return Response({'detail': 'Could not find a row with "Question" column.'}, status=400)

            # 4. Map Columns (Which column letter is "Option A Image"?)
            col_map = {}
            for cell in ws[header_row]:
                if cell.value:
                    # Normalize: "Option A Image" -> "option_a_image"
                    key = str(cell.value).strip().lower().replace(' ', '_')
                    col_map[key] = get_column_letter(cell.column)

            # 5. Read Text Data (Using Pandas for easier text handling)
            file_obj.seek(0)
            df = pd.read_excel(file_obj, header=header_row-1, engine='openpyxl')
            # Normalize DF columns to match our keys
            df.columns = [str(col).strip().lower().replace(' ', '_') for col in df.columns]

            created_count = 0
            errors = []

            # 6. Iterate through rows
            for index, row in df.iterrows():
                try:
                    # Calculate actual Excel row number (1-based)
                    # +1 for 0-index, +1 because pandas skips header, +header_row offset
                    actual_row = header_row + 1 + index
                    
                    row_data = row.to_dict()
                    
                    # --- A. Get Text Data ---
                    q_text = str(row_data.get('question', '')).strip()
                    if q_text == 'nan' or not q_text: 
                        continue # Skip empty rows

                    opt_a = str(row_data.get('option_a', '')).strip()
                    opt_b = str(row_data.get('option_b', '')).strip()
                    opt_c = str(row_data.get('option_c', '')).strip()
                    opt_d = str(row_data.get('option_d', '')).strip()
                    
                    # Clean up 'nan' from pandas
                    if opt_a == 'nan': opt_a = ""
                    if opt_b == 'nan': opt_b = ""
                    if opt_c == 'nan': opt_c = ""
                    if opt_d == 'nan': opt_d = ""

                    # --- B. Handle Correct Answer Mapping ---
                    # If user typed "A", we must save the TEXT of Option A into correct_answer
                    raw_ans = str(row_data.get('correct_answer', '')).strip()
                    final_correct_answer = raw_ans
                    
                    if raw_ans.upper() == 'A': final_correct_answer = opt_a
                    elif raw_ans.upper() == 'B': final_correct_answer = opt_b
                    elif raw_ans.upper() == 'C': final_correct_answer = opt_c
                    elif raw_ans.upper() == 'D': final_correct_answer = opt_d
                    
                    # --- C. Get Images ---
                    # We check if an image exists at the specific (Row, Col) coordinate
                    row_images = {}
                    
                    # Helper to get image data
                    def get_img(field_name):
                        col_letter = col_map.get(field_name)
                        if col_letter:
                            return self._find_image_at_cell(excel_images, actual_row, col_letter)
                        return None

                    img_a = get_img('option_a_image')
                    img_b = get_img('option_b_image')
                    img_c = get_img('option_c_image')
                    img_d = get_img('option_d_image')
                    img_q = get_img('question_image')

                    if img_a: row_images['option_a_image'] = img_a
                    if img_b: row_images['option_b_image'] = img_b
                    if img_c: row_images['option_c_image'] = img_c
                    if img_d: row_images['option_d_image'] = img_d
                    if img_q: row_images['question_image'] = img_q

                    # --- D. Create Database Object ---
                    instance = TemplateQuestion.objects.create(
                        question_paper=question_paper,
                        question=q_text,
                        option_a=opt_a,
                        option_b=opt_b,
                        option_c=opt_c,
                        option_d=opt_d,
                        correct_answer=final_correct_answer
                    )

                    # --- E. Save Images to Object ---
                    if row_images:
                        self._save_images_safe(instance, row_images)

                    created_count += 1

                except Exception as e:
                    print(f"Error on row {index}: {str(e)}")
                    errors.append(f"Row {index}: {str(e)}")

            return Response({
                'status': 'Upload Successful',
                'created_count': created_count,
                'errors': errors
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            traceback.print_exc()
            return Response({'detail': f'Critical Error: {str(e)}'}, status=400)

    # --- Helper Methods ---

    def _extract_images_from_excel(self, ws):
        """Returns a list of all images with their Row/Col coordinates."""
        images = []
        if hasattr(ws, '_images'):
            for img in ws._images:
                try:
                    # Get anchor (position)
                    row, col = None, None
                    anchor = img.anchor
                    
                    # Handle different anchor types
                    if hasattr(anchor, '_from'): 
                        row = anchor._from.row + 1
                        col = get_column_letter(anchor._from.col + 1)
                    elif hasattr(anchor, 'row'):
                        row = anchor.row + 1
                        col = get_column_letter(anchor.col + 1)
                    
                    if row and col:
                        images.append({
                            'row': row, 
                            'col': col, 
                            'data': img._data()
                        })
                except:
                    continue
        return images

    def _find_image_at_cell(self, extracted_images, row, col):
        """Finds if an image exists at specific coordinates."""
        for img in extracted_images:
            if img['row'] == row and img['col'] == col:
                return img['data']
        return None

    def _save_images_safe(self, instance, images_dict):
        """Saves images using ContentFile and Hash to prevent naming errors."""
        has_update = False
        for field, data in images_dict.items():
            try:
                # 1. Determine Extension
                ext = 'png'
                try:
                    with PILImage.open(io.BytesIO(data)) as pimg:
                        ext = pimg.format.lower()
                except:
                    pass
                
                # 2. Generate Safe Filename (No datetime.time error here)
                # We use MD5 hash of image content + instance ID
                img_hash = hashlib.md5(data).hexdigest()[:8]
                filename = f"{field}_{instance.id}_{img_hash}.{ext}"

                # 3. Save
                file_content = ContentFile(data, name=filename)
                getattr(instance, field).save(filename, file_content, save=False)
                has_update = True
            except Exception as e:
                print(f"Failed to save image {field}: {e}")
        
        if has_update:
            instance.save()

    def create(self, request, *args, **kwargs):
        """Handle single question creation with direct file uploads"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        self._handle_direct_file_uploads(request, instance)
        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        """Handle question updates with direct file uploads"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        self._handle_direct_file_uploads(request, instance)
        return Response(self.get_serializer(instance).data)

    def _handle_direct_file_uploads(self, request, instance):
        """Handle direct file uploads for single question operations"""
        image_fields = [
            'question_image',
            'option_a_image',
            'option_b_image',
            'option_c_image',
            'option_d_image'
        ]

        for field in image_fields:
            if field in request.FILES:
                file_obj = request.FILES[field]
                getattr(instance, field).save(file_obj.name, file_obj, save=False)

        instance.save()



from rest_framework import viewsets
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from .models import Hq, Factory, Department, Line, SubLine, Station
from .serializers import HqSerializer, FactorySerializer, DepartmentSerializer, LineSerializer, SubLineSerializer, StationSerializer

# ------------------ ViewSets ------------------
class HqViewSet(viewsets.ModelViewSet):
    queryset = Hq.objects.all()
    serializer_class = HqSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_serializer(self, *args, **kwargs):
        if hasattr(self.request, "data"):
            print("Incoming data:", self.request.data)
        return super().get_serializer(*args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            response = Response()
            origin = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'POST, PUT, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'
            return response

        try:
            print("[HQ CREATE] headers:", dict(request.headers))
            print("[HQ CREATE] content_type:", request.content_type)
            print("[HQ CREATE] data:", request.data)
            print("[HQ CREATE] raw body:", request.body)
        except Exception:
            pass
        resp = super().create(request, *args, **kwargs)
        # Add CORS headers
        origin = request.headers.get('Origin', '*')
        resp['Access-Control-Allow-Origin'] = origin
        resp['Access-Control-Allow-Credentials'] = 'true'
        resp['Vary'] = 'Origin'
        return resp

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            response = Response()
            origin = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'PUT, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'
            return response

        try:
            print(f"[HQ UPDATE partial={partial}] headers:", dict(request.headers))
            print("[HQ UPDATE] content_type:", request.content_type)
            print("[HQ UPDATE] data:", request.data)
            print("[HQ UPDATE] raw body:", request.body)
        except Exception:
            pass
        resp = super().update(request, *args, **kwargs)
        # Add CORS headers
        origin = request.headers.get('Origin', '*')
        resp['Access-Control-Allow-Origin'] = origin
        resp['Access-Control-Allow-Credentials'] = 'true'
        resp['Vary'] = 'Origin'
        return resp


class FactoryViewSet(viewsets.ModelViewSet):
    queryset = Factory.objects.all()
    serializer_class = FactorySerializer
    
    def create(self, request, *args, **kwargs):
        print("\n=== Incoming Request ===")
        print("Method:", request.method)
        print("Headers:", dict(request.headers))
        print("Content-Type:", request.content_type)
        print("Raw data:", request.data)
        print("User:", request.user)
        print("Authenticated:", request.user.is_authenticated)
        
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            print("Handling OPTIONS request")
            response = Response()
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            return response
            
        # Make a mutable copy of the QueryDict
        data = request.data.copy()
        print("Data copy:", data)
        
        try:
            # Call parent's create method
            response = super().create(request, *args, **kwargs)
            
            # Add CORS headers to the response
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Vary'] = 'Origin'
            
            print("Factory created successfully!")
            return response
            
        except Exception as e:
            print("Error creating factory:", str(e))
            response = Response(
                {"error": "Failed to create factory", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
                                            

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def create(self, request, *args, **kwargs):
        print("\n=== Incoming Department Request ===")
        print("Method:", request.method)
        print("Headers:", dict(request.headers))
        print("Data:", request.data)
        
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            print("Handling OPTIONS request")
            response = Response()
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            return response
            
        try:
            # Call parent's create method
            response = super().create(request, *args, **kwargs)
            
            # Add CORS headers to the response
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Vary'] = 'Origin'
            
            print("Department created successfully!")
            return response
            
        except Exception as e:
            print("Error creating department:", str(e))
            response = Response(
                {"error": "Failed to create department", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            return response


class LineViewSet(viewsets.ModelViewSet):
    queryset = Line.objects.all()
    serializer_class = LineSerializer

    def create(self, request, *args, **kwargs):
        print("\n=== Incoming Line Request ===")
        print("Method:", request.method)
        print("Headers:", dict(request.headers))
        print("Data:", request.data)
        
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            print("Handling OPTIONS request")
            response = Response()
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            return response
            
        try:
            # Call parent's create method
            response = super().create(request, *args, **kwargs)
            
            # Add CORS headers to the response
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Vary'] = 'Origin'
            
            print("Line created successfully!")
            return response
            
        except Exception as e:
            print("Error creating line:", str(e))
            response = Response(
                {"error": "Failed to create line", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            return response


class SubLineViewSet(viewsets.ModelViewSet):
    queryset = SubLine.objects.all()
    serializer_class = SubLineSerializer

    def create(self, request, *args, **kwargs):
        print("\n=== Incoming SubLine Request ===")
        print("Method:", request.method)
        print("Headers:", dict(request.headers))
        print("Data:", request.data)
        
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            print("Handling OPTIONS request")
            response = Response()
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            return response
            
        try:
            # Call parent's create method
            response = super().create(request, *args, **kwargs)
            
            # Add CORS headers to the response
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Vary'] = 'Origin'
            
            print("SubLine created successfully!")
            return response
            
        except Exception as e:
            print("Error creating subline:", str(e))
            response = Response(
                {"error": "Failed to create subline", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            return response


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

    def create(self, request, *args, **kwargs):
        print("\n=== Incoming Station Request ===")
        print("Method:", request.method)
        print("Headers:", dict(request.headers))
        print("Data:", request.data)
        
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            print("Handling OPTIONS request")
            response = Response()
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            return response
            
        try:
            # Call parent's create method
            response = super().create(request, *args, **kwargs)
            
            # Add CORS headers to the response
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Vary'] = 'Origin'
            
            print("Station created successfully!")
            return response
            
        except Exception as e:
            print("Error creating station:", str(e))
            response = Response(
                {"error": "Failed to create station", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            return response


# ------------------ AR/VR Views ------------------
from rest_framework import viewsets
from .models import ARVRTrainingContent
from .serializers import ARVRTrainingContentSerializer

class ARVRTrainingContentViewSet(viewsets.ModelViewSet):
    queryset = ARVRTrainingContent.objects.all()
    serializer_class = ARVRTrainingContentSerializer


# --------------------------
# Level 2 Process Dojo
# --------------------------

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LevelWiseTrainingContent, TrainingTopic
from .serializers import LevelWiseTrainingContentSerializer, TrainingTopicSerializer

class LevelWiseTrainingContentViewSet(viewsets.ModelViewSet):
    queryset = LevelWiseTrainingContent.objects.all()
    serializer_class = LevelWiseTrainingContentSerializer

    # Custom endpoint: filter by level, station, and topic
    @action(detail=False, methods=["get"])
    def by_level_station_topic(self, request):
        level_id = request.query_params.get("level_id")
        station_id = request.query_params.get("station_id")
        topic_id = request.query_params.get("topic_id")

        queryset = self.queryset
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        if station_id:
            queryset = queryset.filter(station_id=station_id)
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TrainingTopicViewSet(viewsets.ModelViewSet):
    queryset = TrainingTopic.objects.all()
    serializer_class = TrainingTopicSerializer
    
    def get_queryset(self):
        """Filter topics by level and station from query parameters by default"""
        queryset = TrainingTopic.objects.all()
        level_id = self.request.query_params.get("level_id")
        station_id = self.request.query_params.get("station_id")
        
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        if station_id:
            queryset = queryset.filter(station_id=station_id)
            
        return queryset
    
    # Custom endpoint: filter topics by level and/or station (keeping for backward compatibility)
    @action(detail=False, methods=["get"])
    def by_level_station(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# hanchou & shokucho 



# your_app/views.py

from rest_framework import viewsets
from .models import HanContent, HanSubtopic, HanTrainingContent
from .serializers import (
    HanContentDetailSerializer,
    HanContentListSerializer,
    HanSubtopicSerializer,
    HanTrainingContentSerializer
)

class HanContentViewSet(viewsets.ModelViewSet):
    """
    Handles listing, creating, retrieving, updating, and deleting Main Topics.
    """
    # prefetch_related is a performance optimization that prevents many small database queries.
    queryset = HanContent.objects.prefetch_related('subtopics__materials').all()

    def get_serializer_class(self):
        """
        Chooses the serializer based on the action.
        - For retrieving a single item ('retrieve'), use the detailed serializer.
        - For listing all items ('list'), use the simple serializer.
        """
        if self.action == 'retrieve':
            return HanContentDetailSerializer
        return HanContentListSerializer


# --- MODIFIED VIEWSET FOR SUBTOPICS ---
class HanSubtopicViewSet(viewsets.ModelViewSet):
    serializer_class = HanSubtopicSerializer

    def get_queryset(self):
        """
        Filters subtopics based on a query parameter from the URL.
        Example: GET /api/subtopics/?han_content_id=5
        """
        queryset = HanSubtopic.objects.all()
        han_content_id = self.request.query_params.get('han_content_id')
        if han_content_id:
            queryset = queryset.filter(han_content_id=han_content_id)
        return queryset

    def perform_create(self, serializer):
        """
        When creating, the parent ID must be sent in the request body.
        Example: POST /api/subtopics/ with body {"title": "...", "han_content": 5}
        """
        # The serializer will handle associating the parent, since the ID is in the data.
        serializer.save()

from django.http import FileResponse


class HanTrainingContentViewSet(viewsets.ModelViewSet):
    serializer_class = HanTrainingContentSerializer

    def get_queryset(self):
        """
        Filters materials based on a query parameter from the URL.
        Example: GET /api/materials/?han_subtopic_id=12
        """
        queryset = HanTrainingContent.objects.all()
        subtopic_id = self.request.query_params.get('han_subtopic_id')
        if subtopic_id:
            queryset = queryset.filter(han_subtopic_id=subtopic_id)
        return queryset

    def perform_create(self, serializer):
        """
        When creating, the parent ID must be sent in the request body.
        Example: POST /api/materials/ with body {"description": "...", "han_subtopic": 12}
        """
        serializer.save()


def serve_han_material_file(request, pk):
    """
    Serves the protected media file for a HanTrainingContent object.
    """
    material = get_object_or_404(HanTrainingContent, pk=pk)

    if not material.training_file:
        raise Http404("No file found for this material.")

    try:
        return FileResponse(material.training_file.open('rb'), as_attachment=False)
    except FileNotFoundError:
        raise Http404("File does not exist on the server.")


from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from .models import ShoContent, ShoSubtopic, ShoTrainingContent
from .serializers import (
    ShoContentListSerializer,
    ShoContentDetailSerializer,
    ShoSubtopicSerializer,
    ShoTrainingContentSerializer
)


# --- SHO CONTENT VIEWSET ---
class ShoContentViewSet(viewsets.ModelViewSet):
    """
    Handles listing, creating, retrieving, updating, and deleting Main Topics.
    """
    queryset = ShoContent.objects.prefetch_related('sho_subtopics__sho_materials').all()

    def get_serializer_class(self):
        """
        Chooses the serializer based on the action.
        - For retrieving a single item ('retrieve'), use the detailed serializer.
        - For listing all items ('list'), use the simple serializer.
        """
        if self.action == 'retrieve':
            return ShoContentDetailSerializer
        return ShoContentListSerializer


# --- SHO SUBTOPIC VIEWSET ---
class ShoSubtopicViewSet(viewsets.ModelViewSet):
    serializer_class = ShoSubtopicSerializer

    def get_queryset(self):
        """
        Filters subtopics based on a query parameter from the URL.
        Example: GET /api/sho-subtopics/?sho_content_id=5
        """
        queryset = ShoSubtopic.objects.all()
        sho_content_id = self.request.query_params.get('sho_content_id')
        if sho_content_id:
            queryset = queryset.filter(sho_content_id=sho_content_id)
        return queryset

    def perform_create(self, serializer):
        """
        When creating, the parent ID must be sent in the request body.
        Example: POST /api/sho-subtopics/ with body {"title": "...", "sho_content": 5}
        """
        serializer.save()


# --- SHO TRAINING CONTENT VIEWSET ---
class ShoTrainingContentViewSet(viewsets.ModelViewSet):
    serializer_class = ShoTrainingContentSerializer

    def get_queryset(self):
        """
        Filters materials based on a query parameter from the URL.
        Example: GET /api/sho-materials/?sho_subtopic_id=12
        """
        queryset = ShoTrainingContent.objects.all()
        subtopic_id = self.request.query_params.get('sho_subtopic_id')
        if subtopic_id:
            queryset = queryset.filter(sho_subtopic_id=subtopic_id)
        return queryset

    def perform_create(self, serializer):
        """
        When creating, the parent ID must be sent in the request body.
        Example: POST /api/sho-materials/ with body {"sho_description": "...", "sho_subtopic": 12}
        """
        serializer.save()


def serve_sho_material_file(request, pk):
    """
    Serves the protected media file for a ShoTrainingContent object.
    """
    material = get_object_or_404(ShoTrainingContent, pk=pk)

    if not material.training_file:
        raise Http404("No file found for this material.")

    try:
        return FileResponse(material.training_file.open('rb'), as_attachment=False)
    except FileNotFoundError:
        raise Http404("File does not exist on the server.")







from rest_framework import viewsets
from .models import HanchouExamQuestion
from .serializers import HanchouExamQuestionSerializer

class HanchouExamQuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Hanchou Exam Questions, including bulk upload.
    """
    queryset = HanchouExamQuestion.objects.all()
    serializer_class = HanchouExamQuestionSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @action(detail=False, methods=['get'], url_path='download-template')
    def download_template(self, request, *args, **kwargs):
        """
        Generates and serves an Excel template with sample data for Hanchou questions.
        """
        sample_data = [
            {
                'question': 'What is the largest mammal in the world?',
                'option_a': 'Elephant',
                'option_b': 'Blue Whale',
                'option_c': 'Giraffe',
                'option_d': 'Great White Shark',
                'correct_answer': 'Blue Whale'
            },
            {
                'question': 'Which element has the atomic number 1?',
                'option_a': 'Helium',
                'option_b': 'Oxygen',
                'option_c': 'Hydrogen',
                'option_d': 'Carbon',
                'correct_answer': 'Hydrogen'
            }
        ]
        
        df = pd.DataFrame(sample_data)
        buffer = io.BytesIO()
        
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            # Using a specific sheet name is good practice
            df.to_excel(writer, index=False, sheet_name='Hanchou_Questions')
            
        buffer.seek(0)
        
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="Hanchou_Question_Upload_Template.xlsx"'
        
        return response

    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request, *args, **kwargs):
        """
        Handles bulk creation of Hanchou questions from an Excel file.
        """
        file_obj = request.FILES.get('file')

        if not file_obj:
            return Response({'detail': 'No file was uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # The sheet_name must match the one used in download_template
            df = pd.read_excel(file_obj, sheet_name='Hanchou_Questions', engine='openpyxl')
            df = df.where(pd.notnull(df), None)
        except Exception as e:
            return Response({'detail': f"Error reading the Excel file. Ensure it contains a sheet named 'Hanchou_Questions'. Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        required_columns = {
            'question', 'option_a', 'option_b', 'option_c',
            'option_d', 'correct_answer'
        }
        
        if not required_columns.issubset(df.columns):
            missing_cols = required_columns - set(df.columns)
            return Response({'detail': f'File is missing required columns: {", ".join(missing_cols)}'}, status=status.HTTP_400_BAD_REQUEST)

        questions_to_create = []
        errors = []

        for index, row in df.iterrows():
            row_data = row.to_dict()
            serializer = self.get_serializer(data=row_data)
            
            try:
                # Validate using the model's clean() method
                instance = HanchouExamQuestion(**row_data)
                instance.clean()
                
                # Also run standard serializer validation
                serializer.is_valid(raise_exception=True)
                questions_to_create.append(serializer.validated_data)

            except (DRFValidationError, DjangoValidationError, TypeError) as e:
                error_detail = serializer.errors if hasattr(serializer, 'errors') and serializer.errors else str(e)
                errors.append({'row': index + 2, 'errors': error_detail})
        
        if questions_to_create:
            model_instances = [HanchouExamQuestion(**data) for data in questions_to_create]
            HanchouExamQuestion.objects.bulk_create(model_instances)

        response_data = {
            'status': 'Upload complete.',
            'created_count': len(questions_to_create),
            'error_count': len(errors),
            'errors': errors
        }

        return Response(response_data, status=status.HTTP_201_CREATED)
    

from rest_framework import viewsets, permissions, filters as drf_filters
from django_filters import rest_framework as filters
from .models import HanchouExamResult
from .serializers import HanchouExamResultSerializer

class HanchouExamResultFilter(filters.FilterSet):
    pay_code = filters.CharFilter(field_name="employee__pay_code", lookup_expr="iexact")
    name = filters.CharFilter(field_name="employee__name", lookup_expr="icontains")
    exam_date = filters.DateFromToRangeFilter(field_name="exam_date")
    submitted_at = filters.DateFromToRangeFilter(field_name="submitted_at")
    passed = filters.BooleanFilter()

    class Meta:
        model = HanchouExamResult
        fields = ["employee", "passed", "exam_date"]

class HanchouExamResultViewSet(viewsets.ModelViewSet):
    queryset = HanchouExamResult.objects.select_related("employee").all().order_by("-submitted_at", "-started_at")
    serializer_class = HanchouExamResultSerializer
    # permission_classes = [permissions.IsAuthenticated]  # adjust as needed

    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = HanchouExamResultFilter
    search_fields = ["employee__name", "employee__pay_code", "employee__card_no", "remarks"]
    ordering_fields = ["submitted_at", "exam_date", "score", "total_questions", "duration_seconds"]
    ordering = ["-submitted_at", "-started_at"]

from rest_framework import viewsets
from .models import ShokuchouExamQuestion,ShokuchouExamResult
from .serializers import ShokuchouExamQuestionSerializer,ShokuchouExamResultSerializer

# Add these imports at the top of your views.py
import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

# Your existing model and serializer
from .models import ShokuchouExamQuestion
from .serializers import ShokuchouExamQuestionSerializer


class ShokuchouExamQuestionViewSet(viewsets.ModelViewSet):
    queryset = ShokuchouExamQuestion.objects.all()
    serializer_class = ShokuchouExamQuestionSerializer
    # Add parser classes for the ViewSet to handle file uploads
    parser_classes = [JSONParser, MultiPartParser, FormParser]



    @action(detail=False, methods=['get'], url_path='download-template')
    def download_template(self, request, *args, **kwargs):
        """
        Generates and serves an Excel template with sample data for bulk uploading questions.
        """
        # Define the sample data
        sample_data = [
            {
                'sho_question': 'What is the capital of Japan?',
                'sho_option_a': 'Seoul',
                'sho_option_b': 'Beijing',
                'sho_option_c': 'Tokyo',
                'sho_option_d': 'Bangkok',
                'sho_correct_answer': 'Tokyo'
            },
            {
                'sho_question': 'Which planet is known as the Red Planet?',
                'sho_option_a': 'Earth',
                'sho_option_b': 'Mars',
                'sho_option_c': 'Jupiter',
                'sho_option_d': 'Saturn',
                'sho_correct_answer': 'Mars'
            }
        ]
        
        # Create a pandas DataFrame
        df = pd.DataFrame(sample_data)
        
        # Use an in-memory buffer
        buffer = io.BytesIO()
        
        # Write the DataFrame to the buffer as an Excel file
        # index=False prevents pandas from writing row indices to the file
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Questions')
            
        # Set the buffer's pointer to the beginning
        buffer.seek(0)
        
        # Create the HTTP response
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="Question_Upload_Template.xlsx"'
        
        return response







    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request, *args, **kwargs):
        """
        Handles bulk creation of questions from an Excel file upload.
        The Excel file must have a sheet named 'Questions' and columns:
        'sho_question', 'sho_option_a', 'sho_option_b', 'sho_option_c',
        'sho_option_d', 'sho_correct_answer'.
        """
        file_obj = request.FILES.get('file')

        if not file_obj:
            return Response({'detail': 'No file was uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not file_obj.name.endswith(('.xlsx', '.xls')):
            return Response({'detail': 'Invalid file format. Please upload an Excel file (.xlsx, .xls).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Explicitly read the 'Questions' sheet
            df = pd.read_excel(file_obj, sheet_name='Questions', engine='openpyxl')
            # Replace NaN values with None for proper serialization
            df = df.where(pd.notnull(df), None)
        except Exception as e:
            # Catches errors like missing sheet or unreadable file
            return Response(
                {'detail': f"Error reading the Excel file. Make sure it contains a sheet named 'Questions'. Error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        required_columns = {
            'sho_question', 'sho_option_a', 'sho_option_b', 'sho_option_c',
            'sho_option_d', 'sho_correct_answer'
        }
        
        if not required_columns.issubset(df.columns):
            missing_cols = required_columns - set(df.columns)
            return Response(
                {'detail': f'File is missing required columns: {", ".join(missing_cols)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        questions_to_create = []
        errors = []

        for index, row in df.iterrows():
            row_data = row.to_dict()
            serializer = self.get_serializer(data=row_data)
            
            try:
                # The model's clean() method is not called by default in DRF serializers.
                # We can simulate it by creating a model instance and calling full_clean().
                # This ensures our custom validation rule is checked.
                instance = ShokuchouExamQuestion(**row_data)
                instance.clean() # This will call our custom validation
                
                # We also run serializer validation for data types, max_length, etc.
                serializer.is_valid(raise_exception=True)
                questions_to_create.append(serializer.validated_data)

            except (DRFValidationError, DjangoValidationError, TypeError) as e:
                error_detail = serializer.errors if hasattr(serializer, 'errors') and serializer.errors else str(e)
                errors.append({'row': index + 2, 'errors': error_detail}) # +2 because index is 0-based and header is row 1
        
        # Now, create the actual model instances for bulk_create
        if questions_to_create:
            model_instances = [ShokuchouExamQuestion(**data) for data in questions_to_create]
            ShokuchouExamQuestion.objects.bulk_create(model_instances)

        response_data = {
            'status': 'Upload complete.',
            'created_count': len(questions_to_create),
            'error_count': len(errors),
            'errors': errors
        }

        return Response(response_data, status=status.HTTP_201_CREATED)






class ShokuchouExamResultFilter(filters.FilterSet):
    pay_code = filters.CharFilter(field_name="employee__pay_code", lookup_expr="iexact")
    name = filters.CharFilter(field_name="employee__name", lookup_expr="icontains")
    sho_submitted_at = filters.DateFromToRangeFilter(field_name="sho_submitted_at")
    sho_passed = filters.BooleanFilter()

    class Meta:
        model = ShokuchouExamResult
        fields = ["employee", "sho_passed", "sho_submitted_at"]


# --- SHO RESULT VIEWSET ---
class ShokuchouExamResultViewSet(viewsets.ModelViewSet):
    queryset = (
        ShokuchouExamResult.objects.select_related("employee")
        .all()
        .order_by("-sho_submitted_at", "-sho_started_at")
    )
    serializer_class = ShokuchouExamResultSerializer
    # permission_classes = [permissions.IsAuthenticated]  # enable if needed

    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = ShokuchouExamResultFilter
    search_fields = ["employee__name", "employee__pay_code", "employee__card_no", "sho_remarks"]
    ordering_fields = [
        "sho_submitted_at",
        "sho_score",
        "sho_total_questions",
        "sho_duration_seconds",
    ]
    ordering = ["-sho_submitted_at", "-sho_started_at"]


class HanchouResultCertificatePDF(APIView):
    def get(self, request, pk):
        try:
            result = HanchouExamResult.objects.select_related('employee').get(pk=pk)
            
            employee_name = result.employee.name.strip()
            exam_name = result.exam_name.strip()

            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=landscape(letter))
            width, height = landscape(letter)

            # Define colors and margins
            main_color = (85/255, 26/255, 139/255)
            shadow_color = (200/255, 200/255, 200/255)
            border_color = (244/255, 145/255, 34/255)
            margin = 0.5 * inch

            # Draw the decorative borders
            p.setStrokeColorRGB(*border_color)
            p.setLineWidth(3)
            p.rect(margin, margin, width - 2 * margin, height - 2 * margin)
            p.setStrokeColorRGB(0.9, 0.9, 0.9)
            p.setLineWidth(1)
            p.rect(margin + 5, margin + 5, width - 2 * (margin + 5), height - 2 * (margin + 5))

            # --- DRAW CERTIFICATE CONTENT ---
            
            draw_reflected_text(p, width / 2.0, height - 1.7*inch, "KML SEATING", "Times-Bold", 36, main_color, shadow_color)
            draw_reflected_text(p, width / 2.0, height - 2.4*inch, "HANCHOUE EXAM CERTIFICATE", "Times-Bold", 28, main_color, shadow_color)
            
            p.setFont("Times-Roman", 16)
            p.setFillColorRGB(0.1, 0.1, 0.1)
            p.drawCentredString(width / 2.0, height - 3.7*inch, "THIS IS TO CERTIFY THAT")
            
            draw_reflected_text(p, width / 2.0, height - 4.4*inch, f'“{employee_name.upper()}”', "Times-Bold", 24, main_color, shadow_color, y_offset=1.5)
            
            p.setFont("Times-Roman", 16)
            p.setFillColorRGB(0.1, 0.1, 0.1)
            p.drawCentredString(width / 2.0, height - 5.2*inch, "HAS SUCCESSFULLY PASSED THE")
            
            draw_reflected_text(p, width / 2.0, height - 5.9*inch, exam_name.upper(), "Times-Bold", 22, main_color, shadow_color, y_offset=1.5)

            # Signature
            p.setFont("Times-Roman", 12)
            p.setFillColorRGB(0.1, 0.1, 0.1)
            p.drawRightString(width - margin - 0.5*inch, margin + 0.8*inch, "TRAINER SIGNATURE")
            p.line(width - margin - 2.5*inch, margin + 0.7*inch, width - margin - 0.5*inch, margin + 0.7*inch)

            p.showPage()
            p.save()

            buffer.seek(0)
            return HttpResponse(buffer, content_type='application/pdf', headers={'Content-Disposition': f'attachment; filename="Hanchou_Certificate_{employee_name}.pdf"'})

        except HanchouExamResult.DoesNotExist:
            return Response({"error": "Hanchou exam result not found"}, status=status.HTTP_404_NOT_FOUND)
        except AttributeError:
            return Response({"error": "Associated employee for this result could not be found."}, status=status.HTTP_404_NOT_FOUND)



# Make sure you have all necessary imports at the top of your views.py file
import io
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch

# from .models import Score # Ensure Score model is imported

# This helper function should be defined or imported in your views.py
def draw_reflected_text(p, x, y, text, font_name, font_size, main_color, shadow_color, y_offset=2):
    """Draws centered text with a subtle shadow/reflection effect."""
    # Shadow
    p.setFont(font_name, font_size)
    p.setFillColorRGB(*shadow_color)
    p.drawCentredString(x + y_offset, y - y_offset, text)
    # Main Text
    p.setFillColorRGB(*main_color)
    p.drawCentredString(x, y, text)



# --- Place the draw_reflected_text function here ---
def draw_reflected_text(p, x, y, text, font, size, main_color, shadow_color, x_offset=1.5, y_offset=1.5):
    """Draws text with a simple shadow/reflection underneath."""
    # Draw shadow/reflection
    p.setFont(font, size)
    p.setFillColorRGB(*shadow_color)
    p.drawCentredString(x + x_offset, y - y_offset, text)
    
    # Draw main text
    p.setFillColorRGB(*main_color)
    p.drawCentredString(x, y, text)
# ----------------------------------------------------


class ShokuchouResultCertificatePDF(APIView):
    def get(self, request, pk):
        try:
            # CHANGED: Query ShokuchouExamResult instead of HanchouExamResult
            result = ShokuchouExamResult.objects.select_related('employee').get(pk=pk)
            
            employee_name = result.employee.name.strip()
            # CHANGED: Use sho_exam_name field
            exam_name = result.sho_exam_name.strip()

            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=landscape(letter))
            width, height = landscape(letter)

            # Define colors and margins (kept the same for consistent branding)
            main_color = (85/255, 26/255, 139/255)
            shadow_color = (200/255, 200/255, 200/255)
            border_color = (244/255, 145/255, 34/255)
            margin = 0.5 * inch

            # Draw the decorative borders
            p.setStrokeColorRGB(*border_color)
            p.setLineWidth(3)
            p.rect(margin, margin, width - 2 * margin, height - 2 * margin)
            p.setStrokeColorRGB(0.9, 0.9, 0.9)
            p.setLineWidth(1)
            p.rect(margin + 5, margin + 5, width - 2 * (margin + 5), height - 2 * (margin + 5))

            # --- DRAW CERTIFICATE CONTENT ---
            
            draw_reflected_text(p, width / 2.0, height - 1.7*inch, "KML SEATING", "Times-Bold", 36, main_color, shadow_color)
            # CHANGED: Updated certificate title
            draw_reflected_text(p, width / 2.0, height - 2.4*inch, "SHOKUCHOU EXAM CERTIFICATE", "Times-Bold", 28, main_color, shadow_color)
            
            p.setFont("Times-Roman", 16)
            p.setFillColorRGB(0.1, 0.1, 0.1)
            p.drawCentredString(width / 2.0, height - 3.7*inch, "THIS IS TO CERTIFY THAT")
            
            draw_reflected_text(p, width / 2.0, height - 4.4*inch, f'“{employee_name.upper()}”', "Times-Bold", 24, main_color, shadow_color, y_offset=1.5)
            
            p.setFont("Times-Roman", 16)
            p.setFillColorRGB(0.1, 0.1, 0.1)
            p.drawCentredString(width / 2.0, height - 5.2*inch, "HAS SUCCESSFULLY PASSED THE")
            
            draw_reflected_text(p, width / 2.0, height - 5.9*inch, exam_name.upper(), "Times-Bold", 22, main_color, shadow_color, y_offset=1.5)

            # Signature
            p.setFont("Times-Roman", 12)
            p.setFillColorRGB(0.1, 0.1, 0.1)
            p.drawRightString(width - margin - 0.5*inch, margin + 0.8*inch, "TRAINER SIGNATURE")
            p.line(width - margin - 2.5*inch, margin + 0.7*inch, width - margin - 0.5*inch, margin + 0.7*inch)

            p.showPage()
            p.save()

            buffer.seek(0)
            # CHANGED: Updated the filename for the download
            return HttpResponse(buffer, content_type='application/pdf', headers={'Content-Disposition': f'attachment; filename="Shokuchou_Certificate_{employee_name}.pdf"'})

        # CHANGED: Catch DoesNotExist for the correct model
        except ShokuchouExamResult.DoesNotExist:
            return Response({"error": "Shokuchou exam result not found"}, status=status.HTTP_404_NOT_FOUND)
        except AttributeError:
            return Response({"error": "Associated employee for this result could not be found."}, status=status.HTTP_404_NOT_FOUND)


# 10 cycle

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from collections import defaultdict
from django.shortcuts import get_object_or_404

from .models import (
    TenCycleDayConfiguration,
    TenCycleTopics,
    TenCycleSubTopic,
    TenCyclePassingCriteria,
    OperatorPerformanceEvaluation,
    EvaluationSubTopicMarks,
    MasterTable
)
from .serializers import (
    TenCycleDayConfigurationSerializer,
    TenCycleTopicsSerializer,
    TenCycleSubTopicSerializer,
    TenCyclePassingCriteriaSerializer,
    OperatorPerformanceEvaluationSerializer,
    EvaluationSubMarksSerializer
)


class TenCycleSubTopicViewSet(viewsets.ModelViewSet):
    queryset = TenCycleSubTopic.objects.all()
    serializer_class = TenCycleSubTopicSerializer
    
    @action(detail=False, methods=['get'], url_path='by-topic')
    def by_topic(self, request):
        topic_id = request.query_params.get('topic_id')
        
        if not topic_id:
            return Response(
                {"error": "topic_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        queryset = self.queryset.filter(topic_id=topic_id, is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TenCycleDayConfigurationViewSet(viewsets.ModelViewSet):
    queryset = TenCycleDayConfiguration.objects.all()
    serializer_class = TenCycleDayConfigurationSerializer
    
    @action(detail=False, methods=['get'], url_path='get-configuration')
    def get_configuration(self, request):
        level_id = request.query_params.get('level_id')
        department_id = request.query_params.get('department_id')
        station_id = request.query_params.get('station_id')
        
        if not level_id or not department_id:
            return Response(
                {"error": "level_id and department_id are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.queryset.none()  # Start with an empty queryset

        # 1. If a station_id is provided, try to find a station-specific configuration first.
        if station_id:
            queryset = self.queryset.filter(
                level_id=level_id,
                department_id=department_id,
                station_id=station_id,
                is_active=True
            )
        
        # 2. If no station-specific config exists (or no station_id was provided),
        #    fall back to the department-level configuration.
        if not queryset.exists():
            queryset = self.queryset.filter(
                level_id=level_id,
                department_id=department_id,
                station__isnull=True,  # This is the key change
                is_active=True
            )
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TenCycleTopicsViewSet(viewsets.ModelViewSet):
    queryset = TenCycleTopics.objects.all()
    serializer_class = TenCycleTopicsSerializer

    @action(detail=True, methods=['get'])
    def subtopics(self, request, pk=None):
        topic = self.get_object()
        subtopics = topic.subtopics.all()
        serializer = TenCycleSubTopicSerializer(subtopics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='get-configuration')
    def get_configuration(self, request):
        level_id = request.query_params.get('level_id')
        department_id = request.query_params.get('department_id')
        station_id = request.query_params.get('station_id')
        
        if not level_id or not department_id:
            return Response(
                {"error": "level_id and department_id are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.queryset.none() # Start with an empty queryset

        # 1. If a station_id is provided, try to find a station-specific configuration first.
        if station_id:
            queryset = self.queryset.filter(
                level_id=level_id,
                department_id=department_id,
                station_id=station_id,
                is_active=True
            )
            
        # 2. If no station-specific config exists (or no station_id was provided),
        #    fall back to the department-level configuration.
        if not queryset.exists():
            queryset = self.queryset.filter(
                level_id=level_id,
                department_id=department_id,
                station__isnull=True, # This is the key change
                is_active=True
            )
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# class TenCyclePassingCriteriaViewSet(viewsets.ModelViewSet):
#     queryset = TenCyclePassingCriteria.objects.all()
#     serializer_class = TenCyclePassingCriteriaSerializer

#     def create(self, request, *args, **kwargs):
#         """
#         Custom create method to implement update_or_create logic.
#         This prevents duplicate passing criteria for the same combination.
#         """
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         data = serializer.validated_data

#         # The unique keys for our model
#         lookup_keys = {
#             'level': data.get('level'),
#             'department': data.get('department'),
#             'station': data.get('station')
#         }
        
#         # The data to update or create with
#         defaults = {
#             'passing_percentage': data.get('passing_percentage'),
#             'is_active': data.get('is_active', True)
#         }

#         # Use update_or_create to find a matching record or create a new one
#         instance, created = TenCyclePassingCriteria.objects.update_or_create(
#             **lookup_keys,
#             defaults=defaults
#         )
        
#         # Return the data of the instance (either updated or newly created)
#         response_serializer = self.get_serializer(instance)
#         status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
#         return Response(response_serializer.data, status=status_code)


    
#     @action(detail=False, methods=['get'], url_path='get-configuration')
#     def get_configuration(self, request):
#         level_id = request.query_params.get('level_id')
#         department_id = request.query_params.get('department_id')
#         station_id = request.query_params.get('station_id')
        
#         if not level_id or not department_id:
#             return Response({"error": "level_id and department_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        
#         criteria = None
#         if station_id:
#             # .first() is safer than .get() as it won't crash on duplicates
#             criteria = self.queryset.filter(
#                 level_id=level_id,
#                 department_id=department_id,
#                 station_id=station_id,
#                 is_active=True
#             ).order_by('-id').first()
        
#         if not criteria:
#             # .first() is safer than .get()
#             criteria = self.queryset.filter(
#                 level_id=level_id,
#                 department_id=department_id,
#                 station__isnull=True,
#                 is_active=True
#             ).order_by('-id').first()

#         if not criteria:
#             return Response({"error": "No passing criteria found"}, status=status.HTTP_404_NOT_FOUND)

#         serializer = self.get_serializer(criteria)
#         return Response(serializer.data)





class TenCyclePassingCriteriaViewSet(viewsets.ModelViewSet):
    queryset = TenCyclePassingCriteria.objects.all()
    serializer_class = TenCyclePassingCriteriaSerializer


    
    
    def create(self, request, *args, **kwargs):
        """
        Custom create method to implement update_or_create logic.
        """
        serializer = self.get_serializer(data=request.data)
        # Don't raise exception on validation errors
        serializer.is_valid(raise_exception=False)
        
        data = request.data
        
        # The unique keys for our model
        lookup_keys = {
            'level_id': data.get('level'),
            'department_id': data.get('department'),
            'station_id': data.get('station')
        }
        
        # The data to update or create with
        defaults = {
            'passing_percentage': data.get('passing_percentage'),
            'is_active': data.get('is_active', True),
            'created_by': data.get('created_by')
        }

        # Use update_or_create to find a matching record or create a new one
        instance, created = TenCyclePassingCriteria.objects.update_or_create(
            **lookup_keys,
            defaults=defaults
        )
        
        # Return the data of the instance (either updated or newly created)
        response_serializer = self.get_serializer(instance)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(response_serializer.data, status=status_code)

    
    @action(detail=False, methods=['get'], url_path='get-configuration')
    def get_configuration(self, request):
        level_id = request.query_params.get('level_id')
        department_id = request.query_params.get('department_id')
        station_id = request.query_params.get('station_id')
        
        if not level_id or not department_id:
            return Response({"error": "level_id and department_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        criteria = None
        if station_id:
            # .first() is safer than .get() as it won't crash on duplicates
            criteria = self.queryset.filter(
                level_id=level_id,
                department_id=department_id,
                station_id=station_id,
                is_active=True
            ).order_by('-id').first()
        
        if not criteria:
            # .first() is safer than .get()
            criteria = self.queryset.filter(
                level_id=level_id,
                department_id=department_id,
                station__isnull=True,
                is_active=True
            ).order_by('-id').first()

        if not criteria:
            return Response({"error": "No passing criteria found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(criteria)
        return Response(serializer.data)





class TenCycleConfigurationViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'], url_path='complete-configuration')
    def complete_configuration(self, request):
        level_id = request.query_params.get('level_id')
        department_id = request.query_params.get('department_id')
        station_id = request.query_params.get('station_id')
        
        if not level_id or not department_id:
            return Response({"error": "level_id and department_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Helper function to get data with fallback logic
        def get_data_with_fallback(model, many=True):
            queryset = model.objects.none()
            if station_id:
                queryset = model.objects.filter(level_id=level_id, department_id=department_id, station_id=station_id, is_active=True)
            
            if not queryset.exists():
                queryset = model.objects.filter(level_id=level_id, department_id=department_id, station__isnull=True, is_active=True)
            
            if not many:
                return queryset.first()
            return queryset

        days = get_data_with_fallback(TenCycleDayConfiguration, many=True)
        days_data = TenCycleDayConfigurationSerializer(days, many=True).data
        
        topics = get_data_with_fallback(TenCycleTopics, many=True)
        topics_data = TenCycleTopicsSerializer(topics, many=True).data
        
        for topic_data in topics_data:
            subtopics = TenCycleSubTopic.objects.filter(topic_id=topic_data['id'], is_active=True)
            topic_data['subtopics'] = TenCycleSubTopicSerializer(subtopics, many=True).data
        
        criteria = get_data_with_fallback(TenCyclePassingCriteria, many=False)
        passing_criteria_data = TenCyclePassingCriteriaSerializer(criteria).data if criteria else None
        
        return Response({
            'days': days_data,
            'topics': topics_data,
            'passing_criteria': passing_criteria_data,
        })
 


from .models import TenCycleDailyMetrics
from .serializers import TenCycleDailyMetricsSerializer

class TenCycleDailyMetricsViewSet(viewsets.ModelViewSet):
    queryset = TenCycleDailyMetrics.objects.all()
    serializer_class = TenCycleDailyMetricsSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        evaluation_id = self.request.query_params.get('evaluation')
        day_id = self.request.query_params.get('day')
        
        if evaluation_id:
            queryset = queryset.filter(evaluation_id=evaluation_id)
        if day_id:
            queryset = queryset.filter(day_id=day_id)
            
        return queryset
    






from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

class OperatorPerformanceEvaluationViewSet(viewsets.ModelViewSet):
    queryset = OperatorPerformanceEvaluation.objects.all()
    serializer_class = OperatorPerformanceEvaluationSerializer
    
    def create(self, request, *args, **kwargs):
        print(f"[10 Cycle] Raw create data → {request.data}")

        emp_id = request.data.get('employee')
        level_id = request.data.get('level')
        dept_id = request.data.get('department')
        station_id = request.data.get('station')

        if not emp_id or not level_id or not dept_id or not station_id:
            return Response(
                {"error": "Missing required fields (employee, level, department, station)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get last attempt
        last_eval = (
            OperatorPerformanceEvaluation.objects
            .filter(employee_id=emp_id, level_id=level_id, department_id=dept_id, station_id=station_id)
            .order_by('-attempt_no')
            .first()
        )

        # Get retraining config
        from .models import RetrainingSession, RetrainingConfig
        config = RetrainingConfig.objects.filter(evaluation_type='10 Cycle').first()
        max_attempts = config.max_count if config else 2

        # 🟢 Case 1: First attempt
        if not last_eval:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            evaluation = serializer.save(attempt_no=1)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # 🔁 Case 2: Retraining scheduled → allow new blank attempt
        retraining_exists = RetrainingSession.objects.filter(
            employee_id=emp_id,
            level_id=level_id,
            department_id=dept_id,
            station_id=station_id,
            evaluation_type='10 Cycle',
            status='Scheduled'
        ).exists()

        if retraining_exists and last_eval.final_status and 'Fail' in last_eval.final_status:
            next_attempt = last_eval.attempt_no + 1

            if next_attempt > max_attempts:
                return Response({
                    "error": f"Max attempts ({max_attempts}) reached for this employee."
                }, status=status.HTTP_400_BAD_REQUEST)

            print(f"[10 Cycle] Retraining active → creating new blank attempt {next_attempt}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            evaluation = serializer.save(attempt_no=next_attempt)
            
            # ------- Add This Block To Mark Retraining Completed -------
            retraining = RetrainingSession.objects.filter(
                employee_id=emp_id,
                evaluation_type='10 Cycle',
                level_id=level_id,
                department_id=dept_id,
                station_id=station_id,
                status='Scheduled',
                attempt_no=next_attempt - 1
            ).order_by('-created_at').first()
            if retraining:
                retraining.status = 'Completed'
                retraining.save(update_fields=['status'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # ⚠️ Case 3: Max attempts reached or retraining missing
        return Response({
            "error": "No retraining scheduled or attempt limit reached."
        }, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=False, methods=['get'], url_path='by-employee-code/(?P<employee_code>[^/.]+)')
    def by_employee_code(self, request, employee_code=None):
        employee = get_object_or_404(MasterTable, emp_id=employee_code)

        # Get filter parameters from the query string
        level_id = request.query_params.get('level_id')
        department_id = request.query_params.get('department_id')
        station_id = request.query_params.get('station_id')

        evaluations = OperatorPerformanceEvaluation.objects.filter(employee=employee)

        if level_id:
            evaluations = evaluations.filter(level_id=level_id)
        if department_id:
            evaluations = evaluations.filter(department_id=department_id)
        if station_id:
            evaluations = evaluations.filter(station_id=station_id)


        serializer = self.get_serializer(evaluations, many=True)
        return Response(serializer.data)









class EvaluationSubTopicMarksViewSet(viewsets.ModelViewSet):
    queryset = EvaluationSubTopicMarks.objects.all()
    serializer_class = EvaluationSubMarksSerializer

    @action(detail=False, methods=['get'], url_path='by-employee-code/(?P<employee_code>[^/.]+)')
    def by_employee_code(self, request, employee_code=None):
        # 1. Get query params
        level_id = request.query_params.get('level_id')
        department_id = request.query_params.get('department_id')
        station_id = request.query_params.get('station_id')
        evaluation_id = request.query_params.get('evaluation_id')  # <--- NEW: Capture evaluation_id

        # 2. Validate required params
        if not all([level_id, department_id, station_id]):
            return Response(
                {"error": "level_id, department_id, and station_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = get_object_or_404(MasterTable, emp_id=employee_code)

        try:
            # 3. FIX: Logic to get specific evaluation or latest one
            if evaluation_id:
                # If Frontend sends ID (e.g., ?evaluation_id=14), use it directly.
                evaluation = OperatorPerformanceEvaluation.objects.get(id=evaluation_id)
            else:
                # Fallback: Find the LATEST attempt for this station
                evaluations = OperatorPerformanceEvaluation.objects.filter(
                    employee=employee,
                    level_id=level_id,
                    department_id=department_id,
                    station_id=station_id
                ).order_by('-attempt_no') # Order by attempt descending (3, 2, 1)

                if not evaluations.exists():
                     # No record exists, return blank data
                    return Response({
                        'employee_code': employee_code,
                        'evaluations': [],
                        'per_day_results': [],
                        'total_score': 0,
                        'total_possible_score': 0,
                        'final_status': "Not Evaluated",
                    })
                
                evaluation = evaluations.first() # Take the latest one

        except OperatorPerformanceEvaluation.DoesNotExist:
            return Response({"error": "Evaluation not found"}, status=404)

        # 4. FIX: Filter marks ONLY for this specific evaluation header
        # Do not use 'employee__in=evaluations' as that mixes marks from Attempt 1 and Attempt 2
        marks_qs = EvaluationSubTopicMarks.objects.filter(employee=evaluation) 
        
        serializer = self.get_serializer(marks_qs, many=True)

        days_map = defaultdict(list)
        for mark_obj, mark_data in zip(marks_qs, serializer.data):
            days_map[mark_obj.day.day_name].append((mark_obj, mark_data))

        per_day_results = []
        total_score = 0
        total_possible_score = 0

        for day_name, marks_list in days_map.items():
            day_score = 0
            day_max_score = 0
            for mark_obj, mark_data in marks_list:
                subtopic_score = sum(mark_data.get(f'mark_{i}', 0) or 0 for i in range(1, 11))
                day_score += subtopic_score
                max_score = mark_obj.subtopic.score_required * 10
                day_max_score += max_score

            passing_percentage = 60.0 

            status_str = "Pass" if (day_max_score > 0 and (day_score / day_max_score) * 100 >= passing_percentage) else "Fail - Retraining Required"
            per_day_results.append({
                "day": day_name,
                "score": day_score,
                "max_score": day_max_score,
                "passing_percentage": passing_percentage,
                "status": status_str
            })

            total_score += day_score
            total_possible_score += day_max_score

        final_status = "Not Evaluated"
        if total_possible_score > 0:
            overall_percentage = (total_score / total_possible_score) * 100
            final_status = "Pass" if overall_percentage >= passing_percentage else "Fail - Retraining Required"
        elif evaluation.final_status:
            final_status = evaluation.final_status # Fallback to saved status

        return Response({
            'employee_code': employee_code,
            'evaluations': serializer.data,
            'per_day_results': per_day_results,
            'total_score': total_score,
            'total_possible_score': total_possible_score,
            'final_status': final_status,
            'final_percentage': evaluation.final_percentage # Return percentage if saved
        })


    @action(detail=False, methods=['put'], url_path='update-mark/(?P<employee_code>[^/.]+)')
    def update_by_employee_code(self, request, employee_code=None):
        employee = get_object_or_404(MasterTable, emp_id=employee_code)
        employee_eval_qs = OperatorPerformanceEvaluation.objects.filter(employee=employee)
        evaluations = EvaluationSubTopicMarks.objects.filter(employee__in=employee_eval_qs)

        topic_id = request.data.get('subtopic')
        day_id = request.data.get('day')
        if not topic_id or not day_id:
            return Response({"error": "subtopic and day IDs are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mark_instance = evaluations.get(subtopic_id=topic_id, day_id=day_id)
        except EvaluationSubTopicMarks.DoesNotExist:
            return Response({"error": "Matching mark record not found."}, status=404)

        serializer = EvaluationSubMarksSerializer(mark_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    


    @action(detail=False, methods=['get'], url_path='daily-total/(?P<employee_code>[^/.]+)')
    def daily_total(self, request, employee_code=None):
        level_id = request.query_params.get('level_id')
        department_id = request.query_params.get('department_id')
        station_id = request.query_params.get('station_id')
        evaluation_id = request.query_params.get('evaluation_id') # <--- NEW

        if not all([level_id, department_id, station_id]):
            return Response({"error": "level_id, department_id, and station_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        employee = get_object_or_404(MasterTable, emp_id=employee_code)

        try:
            # FIX: Same logic as above - prioritize ID, fallback to latest
            if evaluation_id:
                evaluation = OperatorPerformanceEvaluation.objects.get(id=evaluation_id)
            else:
                evaluations = OperatorPerformanceEvaluation.objects.filter(
                    employee=employee,
                    level_id=level_id,
                    department_id=department_id,
                    station_id=station_id
                ).order_by('-attempt_no')
                
                if not evaluations.exists():
                     return Response({ 'per_day_totals': [] })
                
                evaluation = evaluations.first()

        except OperatorPerformanceEvaluation.DoesNotExist:
             return Response({ 'per_day_totals': [] })
        
        # FIX: Filter marks strictly by the single evaluation ID found
        marks_qs = EvaluationSubTopicMarks.objects.filter(employee=evaluation)
        
        serializer = self.get_serializer(marks_qs, many=True)

        days_map = defaultdict(list)
        for mark_obj, mark_data in zip(marks_qs, serializer.data):
            days_map[mark_obj.day.day_name].append(mark_data)

        per_day_results = []
        grand_total = 0
        grand_max_total = 0

        for day_name, marks_list in days_map.items():
            day_score = 0
            day_max_score = 0
            for mark in marks_list:
                day_score += mark.get('total_score', 0) or 0
                day_max_score += mark.get('max_possible_score', 0) or 0
            grand_total += day_score
            grand_max_total += day_max_score
            per_day_results.append({
                'day': day_name,
                'total_score': day_score,
                'max_possible_score': day_max_score,
                'percentage': round((day_score / day_max_score)*100, 2) if day_max_score > 0 else 0
            })

        final_percentage = round((grand_total / grand_max_total)*100, 2) if grand_max_total > 0 else 0

        # Pass criteria logic
        try:
            pass_crit = TenCyclePassingCriteria.objects.get(
                level=evaluation.level,
                department=evaluation.department,
                station=evaluation.station
            )
        except TenCyclePassingCriteria.DoesNotExist:
            pass_crit = TenCyclePassingCriteria.objects.filter(
                level=evaluation.level,
                department=evaluation.department,
                station__isnull=True
            ).first()
        
        passing_percentage = pass_crit.passing_percentage if pass_crit else 60.0
        final_status = "Pass" if final_percentage >= passing_percentage else "Fail - Retraining Required"

        return Response({
            'employee_code': employee_code,
            'per_day_totals': per_day_results,
            'grand_total_score': grand_total,
            'grand_max_score': grand_max_total,
            'final_percentage': final_percentage,
            'passing_percentage': passing_percentage,
            'final_status': final_status
        })


    
    @action(detail=True, methods=['get'], url_path='final-report')
    def final_report(self, request, pk=None):
        """
        Returns final evaluation report:
        - final_status
        - last 3 days percentages
        - Day6 quality & productivity
        """
        evaluation = self.get_object()

        # get all days for this evaluation
        day_ids = list(
            TenCycleDayConfiguration.objects.filter(
                level=evaluation.level,
                department=evaluation.department,
                station=evaluation.station,
                is_active=True
            ).order_by("id").values_list("id", flat=True)
        )

        # compute per-day % scores
        subtopic_ids = list(
            TenCycleSubTopic.objects.filter(
                topic__level=evaluation.level,
                topic__department=evaluation.department,
                topic__station=evaluation.station,
                is_active=True
            ).values_list("id", flat=True)
        )

        day_percentages = {}
        for day_id in day_ids:
            marks = EvaluationSubTopicMarks.objects.filter(
                employee=evaluation,
                day_id=day_id,
                subtopic_id__in=subtopic_ids
            )
            total_score = sum(m.total_score or 0 for m in marks)
            total_max = sum(m.max_possible_score or 0 for m in marks)
            perc = (total_score / total_max) * 100 if total_max > 0 else 0.0
            day_percentages[day_id] = round(perc, 2)

        # last 3 days percentages
        last_three_ids = day_ids[-3:] if len(day_ids) >= 3 else day_ids
        last_three_perc = {str(did): day_percentages.get(did, 0) for did in last_three_ids}

        # day6 metrics
        last_day_id = day_ids[-1] if day_ids else None
        quality_rate = None
        productivity = None
        if last_day_id:
            metrics = evaluation.daily_metrics.filter(day_id=last_day_id).first()
            if metrics:
                quality_rate = metrics.quality_rate
                productivity = metrics.productivity

        return Response({
            "evaluation_id": evaluation.id,
            "final_status": evaluation.final_status,
            "last_three_days_percentages": last_three_perc,
            "day6_quality_rate": quality_rate,
            "day6_productivity": productivity,
        })


@api_view(['GET'])
def get_default_level2_config(request):
    """Get first available Level 2 configuration to use as template"""
    level_id = 2
    
    # Find any Level 2 configuration
    first_topic = TenCycleTopics.objects.filter(
        level_id=level_id, 
        station__isnull=True, # Prioritize department-level
        is_active=True
    ).first()

    if not first_topic:
        first_topic = TenCycleTopics.objects.filter(
            level_id=level_id, 
            is_active=True
        ).first()
    
    if not first_topic:
        return Response({
            'topics': [],
            'days': [],
            'passing_criteria': 70
        })
    
    # Get all config for this combination
    topics = TenCycleTopics.objects.filter(
        level=first_topic.level,
        department=first_topic.department,
        station=first_topic.station,
        is_active=True
    ).order_by('slno')
    
    # Serialize topics with subtopics
    topics_data = []
    for topic in topics:
        subtopics = TenCycleSubTopic.objects.filter(
            topic=topic,
            is_active=True
        )
        topics_data.append({
            'slno': topic.slno,
            'cycle_topics': topic.cycle_topics,
            'is_active': True,
            'subtopics': [
                {
                    'sub_topic': st.sub_topic,
                    'score_required': st.score_required,
                    'is_active': True
                }
                for st in subtopics
            ]
        })
    
    # Get days
    days = TenCycleDayConfiguration.objects.filter(
        level=first_topic.level,
        department=first_topic.department,
        station=first_topic.station,
        is_active=True
    ).order_by('sequence_order')
    
    days_data = [{
        'day_name': day.day_name,
        'sequence_order': day.sequence_order,
        'is_active': True
    } for day in days]
    
    # Get passing criteria
    criteria = TenCyclePassingCriteria.objects.filter(
        level=first_topic.level,
        department=first_topic.department,
        station=first_topic.station,
        is_active=True
    ).first()
    
    return Response({
        'topics': topics_data,
        'days': days_data,
        'passing_criteria': criteria.passing_percentage if criteria else 70
    })



#=================================  10 cycle   ================================#


# ======================== Machine Allocation Approval ============ #


from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .serializers import MachineAllocationApprovalSerializer
from .models import MachineAllocation


class MachineAllocationApprovalViewSet(viewsets.ModelViewSet):
    queryset = MachineAllocation.objects.all()
    serializer_class = MachineAllocationApprovalSerializer

    @action(detail=True, methods=['put'], url_path='set-status')
    def set_status(self, request, pk=None):
        allocation = self.get_object()
        status_value = request.data.get('approval_status')

        if status_value not in dict(MachineAllocation.APPROVAL_STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        allocation.approval_status = status_value
        allocation.save()
        return Response({
            'status': 'success',
            'id': allocation.id,
            'approval_status': allocation.approval_status
        })

    @action(detail=True, methods=['put'], url_path='reject')
    def reject(self, request, pk=None):
        allocation = self.get_object()
        allocation.approval_status = 'rejected'
        allocation.save()
        return Response({
            'status': 'rejected',
            'id': allocation.id,
            'approval_status': allocation.approval_status
        }, status=status.HTTP_200_OK)



from .serializers import EmployeeWithStatusSerializer

class EmployeeMachineAllocationViewSet(viewsets.ModelViewSet):
    queryset = MachineAllocation.objects.all()
    serializer_class = ...  # your main MachineAllocation serializer

    @action(detail=False, methods=['get'], url_path='eligible-employees')
    def eligible_employees(self, request):
        machine_id = request.query_params.get('machine_id')
        if not machine_id:
            return Response({'error': 'machine_id is required'}, status=400)

        try:
            machine = Machine.objects.get(id=machine_id)
        except Machine.DoesNotExist:
            return Response({'error': 'Machine not found'}, status=404)

        # matching_skills = OperatorSkill.objects.filter(station__skill=machine.process) # skilmatrix table
        # employee_ids = matching_skills.values_list('operator_id', flat=True).distinct()
        # employees = MasterTable.objects.filter(id__in=employee_ids)

        # serializer = EmployeeWithStatusSerializer(employees, many=True, context={'machine_id': machine_id})
        # return Response(serializer.data)


# =========================== Machine Allocation Approval =============================== # 

from rest_framework import viewsets
from .models import OJTTopic
from .serializers import OJTTopicSerializer

class OJTTopicViewSet(viewsets.ModelViewSet):
    queryset = OJTTopic.objects.all().order_by("sl_no")
    serializer_class = OJTTopicSerializer





from rest_framework import viewsets
from .models import OJTDay
from .serializers import OJTDaySerializer

class OJTDayViewSet(viewsets.ModelViewSet):
    queryset = OJTDay.objects.all().order_by("id")
    serializer_class = OJTDaySerializer









from rest_framework import viewsets
from .models import OJTScore
from .serializers import OJTScoreSerializer

class OJTScoreViewSet(viewsets.ModelViewSet):
    queryset = OJTScore.objects.all()
    serializer_class = OJTScoreSerializer

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import OJTScoreRange
from .serializers import OJTScoreRangeSerializer


class OJTScoreRangeViewSet(viewsets.ModelViewSet):
    queryset = OJTScoreRange.objects.all().order_by("id")
    serializer_class = OJTScoreRangeSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get("department")
        level_id = self.request.query_params.get("level")

        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)

        return queryset

from rest_framework import viewsets
from .models import OJTPassingCriteria
from .serializers import OJTPassingCriteriaSerializer


class OJTPassingCriteriaViewSet(viewsets.ModelViewSet):
    queryset = OJTPassingCriteria.objects.all()
    serializer_class = OJTPassingCriteriaSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get("department")
        level_id = self.request.query_params.get("level")

        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)

        return queryset

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import TraineeInfo
from .serializers import TraineeInfoSerializer
from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import TraineeInfo, OJTScore, OJTTopic, OJTScoreRange, OJTPassingCriteria
from .serializers import TraineeInfoSerializer
from .signals import run_after_delay,update_skill_matrix

class TraineeInfoViewSet(viewsets.ModelViewSet):
    queryset = TraineeInfo.objects.all()
    serializer_class = TraineeInfoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        emp_id = self.request.query_params.get('emp_id', '').strip()
        station_id = self.request.query_params.get('station_id')
        level_id = self.request.query_params.get('level_id')

        print(f"[GET] Params → emp_id={emp_id}, station={station_id}, level={level_id}")

        if emp_id:
            queryset = queryset.filter(emp_id__iexact=emp_id)
        if station_id:
            queryset = queryset.filter(station_id=station_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)

        print(f"[GET] → {queryset.count()} record(s)")
        return queryset
    
    def create(self, request, *args, **kwargs):
        print(f"[POST] Raw data → {request.data}")

        emp_id = request.data.get('emp_id', '').strip()
        if not emp_id:
           return Response({"error": "Employee ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        station_id = request.data.get('station')
        level_id = request.data.get('level')

        # Get last OJT attempt for this emp/station/level
        last_ojt = (
            TraineeInfo.objects.filter(emp_id=emp_id, station_id=station_id, level_id=level_id)
            .order_by('-attempt_no')
            .first()
        )

        # ----------------------------
        # CASE 1: First attempt
        # ----------------------------
        if not last_ojt:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            trainee = serializer.save(attempt_no=1)
            self._post_save(trainee)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # ✅ ✅ NEW: CASE 1.3 - Retraining exists → Create blank new attempt
        from .models import RetrainingSession

        retraining_exists = RetrainingSession.objects.filter(
            employee__emp_id=emp_id,
            evaluation_type='OJT',
            station_id=station_id,
            level_id=level_id,
            status__in=['Pending', 'Scheduled']
        ).exists()

        if retraining_exists and last_ojt.status in ['Completed', 'Failed']:
            print(f"[OJT] Retraining found → creating new blank attempt {last_ojt.attempt_no + 1}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            trainee = serializer.save(attempt_no=last_ojt.attempt_no + 1)
            self._post_save(trainee)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # ----------------------------
        # CASE 1.5: Ongoing (Pending) attempt
        # ----------------------------
        if last_ojt.status == "Pending":
            print(f"[OJT] Continuing existing attempt_no={last_ojt.attempt_no} (status Pending)")
            serializer = self.get_serializer(last_ojt, data=request.data, partial=False)
            serializer.is_valid(raise_exception=True)
            updated = serializer.save(attempt_no=last_ojt.attempt_no)
            self._post_save(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # ----------------------------
        # CASE 2: New attempt (after Fail + Retraining Scheduled)
        # ----------------------------
        from .models import RetrainingSession

        # Check max attempts allowed
        config = RetrainingConfig.objects.filter(evaluation_type='OJT').first()
        max_attempts = config.max_count if config else 2

        if last_ojt.attempt_no >= max_attempts:
            return Response(
                {"error": f"Max attempts ({max_attempts}) reached. No more OJT allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ Check if retraining session exists for same emp/level/station/department
        # Safely derive department_id (from request or from station)
        department_id = request.data.get("department")
        if not department_id and last_ojt.station_id:
            # Fallback to station’s department
            department_id = getattr(last_ojt.station, "department_id", None)

        print(f"[DEBUG] Retraining check → emp={emp_id}, level={level_id}, station={station_id}, dept={department_id}")

        retraining = (
            RetrainingSession.objects.filter(
                employee__emp_id=emp_id,
                evaluation_type='OJT',
                level_id=level_id,          # ✅ use _id since passing numeric
                department_id=department_id,  # ✅ now safely defined
                station_id=station_id,      # ✅ use _id
                status='Scheduled'
            ).order_by('-created_at').first()
        )



        if not retraining:
            return Response(
                {"error": "Retraining not scheduled or not marked as 'Scheduled' for this station/level."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Check if previous OJT record failed
        if last_ojt.status != 'Fail':
            return Response(
                {"error": "Previous OJT attempt must be 'Fail' to start retraining attempt."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Passed checks → allow new OJT attempt
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_ojt = serializer.save(attempt_no=last_ojt.attempt_no + 1)

        # ✅ Mark retraining session as completed after OJT submission
        retraining.status = 'Completed'
        retraining.save(update_fields=['status'])

        # ✅ Trigger recalculations + skill matrix
        self._post_save(new_ojt)

        return Response(serializer.data, status=status.HTTP_201_CREATED)




    def update(self, request, *args, **kwargs):
        partial = kwargs.get('partial', False)
        instance = self.get_object()

        incoming_level = request.data.get('level')
        if incoming_level and int(incoming_level) != instance.level_id:
            return Response({
                "error": "Cannot change level",
                "detail": f"Use POST to create new level record.",
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return self._update_and_respond(instance, serializer)

    def _update_and_respond(self, instance, serializer):
        scores_data = serializer.validated_data.pop('scores', [])

        # Update scalar fields
        for attr, value in serializer.validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Replace scores
        instance.scores.all().delete()
        for score_data in scores_data:
            OJTScore.objects.create(trainee=instance, **score_data)

        self._post_save(instance)
        return Response(self.get_serializer(instance).data)
    # ------------------------------------------------------------------
    # 5. POST-SAVE
    # ------------------------------------------------------------------
    def _post_save(self, trainee):
        self.perform_recalculate_status(trainee)
        self.trigger_skill_matrix_update(trainee)

    # ------------------------------------------------------------------
    # 6. RECALCULATE STATUS
    # ------------------------------------------------------------------
    def perform_recalculate_status(self, trainee):
        first_score = trainee.scores.first()
        if not first_score:
            trainee.status = "Pending"
            trainee.save(update_fields=["status"])
            return

        department = first_score.topic.department
        level = first_score.topic.level
        level_id = self._get_id(level)

        required_days = OJTDay.objects.filter(department=department, level_id=level_id).distinct()
        if not required_days.exists():
            trainee.status = "Pending"
            trainee.save(update_fields=["status"])
            return

        try:
            score_range = OJTScoreRange.objects.get(department=department, level_id=level_id)
            max_topic_score = score_range.max_score
        except OJTScoreRange.DoesNotExist:
            trainee.status = "Pending"
            trainee.save(update_fields=["status"])
            return

        # ✅ NEW: Don't mark Fail until all required days have data
        completed_day_ids = (
            OJTScore.objects.filter(trainee=trainee)
            .values_list("day_id", flat=True)
            .distinct()
        )
        required_day_ids = list(required_days.values_list("id", flat=True))

        # If trainee hasn’t submitted for all required days → still Pending
        if not set(required_day_ids).issubset(set(completed_day_ids)):
            trainee.status = "Pending"
            trainee.save(update_fields=["status"])
            return

        all_passed = True
        for day in required_days:
            criteria = (
                OJTPassingCriteria.objects.filter(department=department, level_id=level_id, day=day).first()
                or OJTPassingCriteria.objects.filter(department=department, level_id=level_id, day__isnull=True).first()
            )
            if not criteria:
                trainee.status = "Pending"
                trainee.save(update_fields=["status"])
                return

            required_pct = criteria.percentage
            topics = OJTTopic.objects.filter(department=department, level_id=level_id)
            total_topics = topics.count()

            actual = OJTScore.objects.filter(trainee=trainee, day=day, topic__in=topics).aggregate(total=Sum("score"))["total"] or 0
            count = OJTScore.objects.filter(trainee=trainee, day=day, topic__in=topics).count()

            if count < total_topics:
                trainee.status = "Pending"
                trainee.save(update_fields=["status"])
                return

            max_possible = total_topics * max_topic_score
            pct = (actual / max_possible) * 100 if max_possible > 0 else 0

            if pct < required_pct:
                all_passed = False
                break

        trainee.status = "Pass" if all_passed else "Fail"
        trainee.save(update_fields=["status"])


    # ------------------------------------------------------------------
    # 7. SKILL MATRIX – ONLY IF VALID
    # ------------------------------------------------------------------
    def trigger_skill_matrix_update(self, trainee):
        if not trainee.emp_id or trainee.emp_id.strip() == '':
            print(f"[SKILL MATRIX] SKIPPED – emp_id missing (ID={trainee.id})")
            return

        if trainee.status != "Pass":
            print(f"[SKILL MATRIX] SKIPPED – status={trainee.status} (emp_id={trainee.emp_id})")
            return

        try:
            employee = MasterTable.objects.get(emp_id=trainee.emp_id.strip())
            run_after_delay(
                update_skill_matrix,
                5,
                employee,
                trainee.station,
                trainee.level,
                True
            )
            print(f"[SKILL MATRIX] TRIGGERED → emp_id={trainee.emp_id}")
        except MasterTable.DoesNotExist:
            print(f"[SKILL MATRIX] SKIPPED – No MasterTable for emp_id={trainee.emp_id}")
        except Exception as e:
            print(f"[SKILL MATRIX] ERROR → {e}")

    # ------------------------------------------------------------------
    # HELPER: Extract ID
    # ------------------------------------------------------------------
    def _get_id(self, obj_or_int):
        if hasattr(obj_or_int, 'pk'):
            return obj_or_int.pk
        if hasattr(obj_or_int, 'id'):
            return obj_or_int.id
        return int(obj_or_int)






# views.py
from rest_framework.generics import ListAPIView
from .models import OJTTopic
from .serializers import OJTTopicSerializer

class OJTTopicListView(ListAPIView):
    serializer_class = OJTTopicSerializer

    def get_queryset(self):
        queryset = OJTTopic.objects.all()
        department_id = self.request.query_params.get("department")
        level_id = self.request.query_params.get("level")

        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)

        return queryset
    


from rest_framework.generics import ListAPIView
from .models import OJTDay
from .serializers import OJTDaySerializer

class OJTDayListView(ListAPIView):
    serializer_class = OJTDaySerializer

    def get_queryset(self):
        queryset = OJTDay.objects.all()
        department_id = self.request.query_params.get("department")
        level_id = self.request.query_params.get("level")

        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)

        return queryset
    



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class TraineeInfoListView(APIView):
    def get(self, request):
        emp_id = request.query_params.get('emp_id', '').strip()
        station_id = request.query_params.get('station_id')
        level_id = request.query_params.get('level_id')
        
        print(f"[LIST VIEW] Filtering: emp_id='{emp_id}', station={station_id}, level={level_id}")
        
        queryset = TraineeInfo.objects.all()
        
        if emp_id:
            queryset = queryset.filter(emp_id__iexact=emp_id)
        if station_id:
            queryset = queryset.filter(station_id=station_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        
        print(f"[LIST VIEW] Found {queryset.count()} records")
        
        serializer = TraineeInfoSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

from rest_framework import viewsets
from .models import QuantityOJTScoreRange, QuantityPassingCriteria
from .serializers import QuantityOJTScoreRangeSerializer, QuantityPassingCriteriaSerializer    
from rest_framework import viewsets
from .models import OJTLevel2Quantity, Level
from .serializers import OJTLevel2QuantitySerializer, LevelSerializer


class OJTLevel2QuantityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for OJT Level 2 Quantity with nested evaluations.
    Supports filtering by trainee_id, level, and station.
    """
    queryset = OJTLevel2Quantity.objects.all()
    serializer_class = OJTLevel2QuantitySerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        trainee_id = self.request.query_params.get("trainee_id")
        level_id = self.request.query_params.get("level")
        station_id  = self.request.query_params.get("station")

        if trainee_id:
            queryset = queryset.filter(trainee_id=trainee_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        if station_id:
            queryset = queryset.filter(station_id =station_id)  # case-insensitive match

        return queryset



# =================== Refreshment Training ============================= #

from rest_framework import viewsets
from .models import Training_category, Curriculum, CurriculumContent, Trainer_name, Venues, Schedule, MasterTable , RescheduleLog,EmployeeAttendance
from .serializers import Training_categorySerializer, CurriculumSerializer, CurriculumContentSerializer, Trainer_nameSerializer, VenuesSerializer, ScheduleSerializer, MasterTableSerializer, EmployeeAttendanceSerializer, RescheduleLogSerializer

class Training_categoryViewSet(viewsets.ModelViewSet):
    queryset = Training_category.objects.all()
    serializer_class = Training_categorySerializer

class CurriculumViewSet(viewsets.ModelViewSet):
    serializer_class = CurriculumSerializer

    def get_queryset(self):
        queryset = Curriculum.objects.all()
        category_id = self.request.query_params.get('category_id')
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)
        return queryset

class CurriculumContentViewSet(viewsets.ModelViewSet):
    serializer_class = CurriculumContentSerializer

    def get_queryset(self):
        queryset = CurriculumContent.objects.all()
        curriculum_id = self.request.query_params.get('curriculum')
        if curriculum_id is not None:
            queryset = queryset.filter(curriculum_id=curriculum_id)
        return queryset

class Trainer_nameViewSet(viewsets.ModelViewSet):
    queryset = Trainer_name.objects.all()
    serializer_class = Trainer_nameSerializer

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venues.objects.all()
    serializer_class = VenuesSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import EmployeeAttendance, RescheduleLog
from .serializers import EmployeeAttendanceSerializer, RescheduleLogSerializer


class EmployeeAttendanceViewSet(viewsets.ModelViewSet):
    queryset = EmployeeAttendance.objects.all()
    serializer_class = EmployeeAttendanceSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        attendance_instance = serializer.save()

        print(f"Attendance created: status={attendance_instance.status}")

        if attendance_instance.status == 'rescheduled':
            if not (attendance_instance.reschedule_date and attendance_instance.reschedule_time and attendance_instance.reschedule_reason):
                print("Missing reschedule details; skipping RescheduleLog creation")
            else:
                try:
                    RescheduleLog.objects.create(
                        schedule=attendance_instance.schedule,
                        employee=attendance_instance.employee,
                        original_date=attendance_instance.schedule.date,
                        original_time=attendance_instance.schedule.time,
                        new_date=attendance_instance.reschedule_date,
                        new_time=attendance_instance.reschedule_time,
                        reason=attendance_instance.reschedule_reason,
                    )
                    print("RescheduleLog created")
                except Exception as e:
                    print("Error creating RescheduleLog:", e)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def by_schedule(self, request):
        schedule_id = request.query_params.get('schedule_id')
        if not schedule_id:
            return Response({"detail": "schedule_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        attendances = self.queryset.filter(schedule_id=schedule_id)
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)




from rest_framework import viewsets
from rest_framework.response import Response

from .models import RescheduleLog
from .serializers import RescheduleLogSerializer


class RescheduleLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Viewset to retrieve Reschedule Logs (Read-only).
    Optional filtering by schedule or employee.
    """
    queryset = RescheduleLog.objects.all()
    serializer_class = RescheduleLogSerializer

    def list(self, request, *args, **kwargs):
        schedule_id = request.query_params.get('schedule_id')
        employee_id = request.query_params.get('employee_id')

        queryset = self.queryset

        if schedule_id:
            queryset = queryset.filter(schedule_id=schedule_id)

        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# =================== Refreshment Training End ============================= #

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Department, Station, StationSetting
from .serializers import DepartmentselectSerializer, StationselectSerializer, StationSettingSerializer

class DepartmentListView(APIView):
    def get(self, request):
        departments = Department.objects.all()
        serializer = DepartmentselectSerializer(departments, many=True)
        return Response(serializer.data)

class StationsByDepartmentView(APIView):
    def get(self, request, department_id):
        stations = Station.objects.filter(subline_linedepartment_department_id=department_id)
        serializer = StationselectSerializer(stations, many=True)
        return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import StationSetting, Department, Station
from .serializers import StationSettingSerializer

class StationSettingCreateView(APIView):
    def get(self, request):
        department_id = request.query_params.get('department_id')
        if not department_id:
            return Response(
                {"error": "department_id query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
                 
        try:
            department = Department.objects.get(department_id=department_id)
        except Department.DoesNotExist:
            return Response(
                {"error": "Department not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Group settings by station
        settings = StationSetting.objects.filter(department=department).select_related('station', 'department')
        
        # Group by station
        station_groups = {}
        for setting in settings:
            station_key = setting.station.station_id
            if station_key not in station_groups:
                station_groups[station_key] = {
                    'department_id': setting.department.department_id,
                    'department_name': setting.department.department_name,
                    'station_id': setting.station.station_id,
                    'station_name': setting.station.station_name,
                    'all_options': []
                }
            station_groups[station_key]['all_options'].append(setting.option)
        
        # Convert to list and remove duplicates from options
        result = []
        for station_data in station_groups.values():
            station_data['all_options'] = list(set(station_data['all_options']))
            result.append(station_data)
        
        return Response(result, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = StationSettingSerializer(data=request.data)
        if serializer.is_valid():
            created_settings = serializer.save()
            return Response({"success": True, "created": len(created_settings)}, status=201)
        return Response(serializer.errors, status=400)


# =================== Retraining start ============================= #

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from collections import defaultdict
from django.shortcuts import get_object_or_404

from .models import (
    RetrainingSession, RetrainingConfig, MasterTable,
   
    OperatorPerformanceEvaluation, TenCyclePassingCriteria,
      
    TraineeInfo, OJTPassingCriteria, OJTScoreRange,
    
    Score, EvaluationPassingCriteria,
    Department, Level, Station
)
from .serializers import RetrainingSessionSerializer, RetrainingConfigSerializer



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import RetrainingConfig


class EvaluationTypeMaxAttemptView(APIView):
    """
    Returns max attempt count from RetrainingConfig based only on evaluation_type.
    Works for OJT, 10CYCLE, and EVALUATION.
    Always defaults to 2 if no config is found.
    """

    def get(self, request, *args, **kwargs):
        evaluation_type = request.GET.get("evaluation_type")
        if not evaluation_type:
            return Response(
                {"error": "evaluation_type parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            qs = RetrainingConfig.objects.filter(
                evaluation_type__iexact=evaluation_type
            )

            # ✅ Only filter by is_active if that field exists
            if any(f.name == "is_active" for f in RetrainingConfig._meta.get_fields()):
                qs = qs.filter(is_active=True)

            config = qs.first()

            if config:
                return Response(
                    {
                        "evaluation_type": config.evaluation_type,
                        "max_attempts": config.max_count,
                    },
                    status=status.HTTP_200_OK,
                )

            # ✅ Default fallback when not found
            return Response(
                {
                    "evaluation_type": evaluation_type,
                    "max_attempts": 2,
                    "note": "No config found, using default max_attempts = 2",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            import traceback
            print("🔥 Error in EvaluationTypeMaxAttemptView:", traceback.format_exc())
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RetrainingConfigViewSet(viewsets.ModelViewSet):
    queryset = RetrainingConfig.objects.all()
    serializer_class = RetrainingConfigSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        evaluation_type = self.request.query_params.get('evaluation_type')
        if evaluation_type:
            queryset = queryset.filter(evaluation_type=evaluation_type)
            
        return queryset
    
    
class RetrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = RetrainingSession.objects.all().order_by("-created_at")
    serializer_class = RetrainingSessionSerializer

    def create(self, request, *args, **kwargs):
        """Schedule a new retraining session with status='Scheduled'."""
        print(f"[POST Retraining] Raw data → {request.data}")

        employee_id = request.data.get('employee')
        level_id = request.data.get('level')
        department_id = request.data.get('department')
        station_id = request.data.get('station')
        evaluation_type = request.data.get('evaluation_type')

        if not (employee_id and level_id and department_id and evaluation_type):
            return Response(
                {"error": "Missing required fields: employee, level, department, evaluation_type"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Step 1: Prevent multiple scheduled sessions
        existing_scheduled = RetrainingSession.objects.filter(
            employee_id=employee_id,
            level_id=level_id,
            department_id=department_id,
            station_id=station_id,
            evaluation_type=evaluation_type,
            status='Scheduled'
        ).exists()

        if existing_scheduled:
            return Response(
                {"error": "A retraining session is already scheduled for this employee."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Step 2: Get max allowed retraining sessions
        config = RetrainingConfig.objects.filter(
            evaluation_type=evaluation_type
        ).first()
        max_retraining_sessions = config.max_count if config else 2

        existing_sessions = RetrainingSession.objects.filter(
            employee_id=employee_id,
            level_id=level_id,
            department_id=department_id,
            station_id=station_id,
            evaluation_type=evaluation_type
        )

        existing_count = existing_sessions.count()
        if existing_count >= max_retraining_sessions:
            return Response({
                'error': f'Maximum retraining sessions ({max_retraining_sessions}) reached for this employee and evaluation combination.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Step 3: Force status='Scheduled'
        data = request.data.copy()
        data['status'] = 'Scheduled'
        data['attempt_no'] = existing_count + 1  # Correct numbering (not +2)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        retraining = serializer.save()

        print(f"[Retraining] Scheduled for Employee ID={employee_id}, Attempt={retraining.attempt_no}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['patch'], url_path='complete-session')
    def complete_session(self, request, pk=None):
        """Complete a retraining session with results and observations"""
        try:
            session = self.get_object()
            
            if session.status != 'Scheduled':
                return Response(
                    {'error': 'Only pending sessions can be completed'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update main session with completion data
            session.status = request.data.get('status', 'Completed')
            session.performance_percentage = request.data.get('performance_percentage')
            session.required_percentage = request.data.get('required_percentage')
            session.save()
            
            # Update session detail with observations and trainer info
            session_detail, created = RetrainingSessionDetail.objects.get_or_create(
                retraining_session=session
            )
            
            if 'observations_failure_points' in request.data:
                session_detail.observations_failure_points = request.data['observations_failure_points']
            
            if 'trainer_name' in request.data:
                session_detail.trainer_name = request.data['trainer_name']
            
            session_detail.save()
            
            # Return updated session with detail
            updated_serializer = self.get_serializer(session)
            return Response(updated_serializer.data)
            
        except RetrainingSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['patch'], url_path='update-observations')
    def update_observations(self, request, pk=None):
        """Update only observations and trainer info (for partial updates)"""
        try:
            session = self.get_object()
            
            # Get or create session detail
            session_detail, created = RetrainingSessionDetail.objects.get_or_create(
                retraining_session=session
            )
            
            # Update only the fields provided
            if 'observations_failure_points' in request.data:
                session_detail.observations_failure_points = request.data['observations_failure_points']
            
            if 'trainer_name' in request.data:
                session_detail.trainer_name = request.data['trainer_name']
            
            session_detail.save()
            
            # Return updated session with detail
            updated_serializer = self.get_serializer(session)
            return Response(updated_serializer.data)
            
        except RetrainingSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    

    @action(detail=False, methods=['get'], url_path='employee-sessions/(?P<employee_id>[^/.]+)')
    def get_employee_sessions(self, request, employee_id=None):
        """Get all retraining sessions for a specific employee, ordered by attempt number"""
        try:
            employee = MasterTable.objects.get(emp_id=employee_id)
            sessions = RetrainingSession.objects.filter(
                employee=employee
            ).select_related('session_detail').order_by(
                'evaluation_type', 'level', 'department', 'station', 'attempt_no'
            )
            
            serializer = self.get_serializer(sessions, many=True)
            return Response({
                'employee_id': employee_id,
                'employee_name': f"{employee.first_name or ''} {employee.last_name or ''}".strip(),
                'sessions': serializer.data
            })
            
        except MasterTable.DoesNotExist:
            return Response(
                {'error': 'Employee not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='failed-employees')
    def get_failed_employees(self, request):
        """Get all failed employees from all evaluation types with retraining status"""
        failed_employees = []
        
        # Get failed employees from each evaluation system
        ten_cycle_failed = self._get_10cycle_failed_employees()
        failed_employees.extend(ten_cycle_failed)
        
        ojt_failed = self._get_ojt_failed_employees()
        failed_employees.extend(ojt_failed)
        
        evaluation_failed = self._get_evaluation_failed_employees()
        failed_employees.extend(evaluation_failed)
        
        print(f"10 Cycle failures: {len(ten_cycle_failed)}")      
        print(f"OJT failures: {len(ojt_failed)}")                  
        print(f"Evaluation failures: {len(evaluation_failed)}")  
        print(f"Total failures: {len(failed_employees)}") 
        
        # Apply filters
        department_id = request.query_params.get('department_id')
        evaluation_type = request.query_params.get('evaluation_type')
        status_filter = request.query_params.get('status')
        
        if department_id:
            failed_employees = [emp for emp in failed_employees if emp.get('department_id') == int(department_id)]
        
        if evaluation_type:
            failed_employees = [emp for emp in failed_employees if emp.get('evaluation_type') == evaluation_type]
            
        if status_filter:
            failed_employees = [emp for emp in failed_employees if emp.get('retraining_status') == status_filter]
        
        return Response({
            'count': len(failed_employees),
            'results': failed_employees
        })
        
    
    

    
    
    def _get_10cycle_failed_employees(self):
        """Get failed employees from 10 Cycle evaluations (with correct attempt logic)."""
        failed_employees = []
        from .models import OperatorPerformanceEvaluation

        fail_evaluations = OperatorPerformanceEvaluation.objects.filter(
            final_status='Fail',
            is_completed=True
        ).select_related('employee', 'department', 'station', 'level')

        for evaluation in fail_evaluations:
            employee = evaluation.employee
            department = evaluation.department
            level = evaluation.level
            station = evaluation.station

            # Passing Criteria
            try:
                criteria = TenCyclePassingCriteria.objects.get(
                    level=level, department=department, station=station, is_active=True
                )
                required_percentage = criteria.passing_percentage
            except TenCyclePassingCriteria.DoesNotExist:
                required_percentage = 60.0

            # Retraining sessions
            existing_sessions = RetrainingSession.objects.filter(
                employee=employee,
                level=level,
                department=department,
                station=station,
                evaluation_type='10 Cycle'
            ).select_related('session_detail').order_by('-attempt_no')

            retraining_count = existing_sessions.count()

            # Max attempts from config
            config = RetrainingConfig.objects.filter(
                evaluation_type='10 Cycle'
            ).first()
            max_attempts = config.max_count if config else 2

            # Correct attempt logic: 1 (original) + retraining sessions
            total_attempts_used = 1 + retraining_count

            # Determine status
            retraining_status = self._determine_retraining_status(
                employee.emp_id,
                '10 Cycle',
                level.level_id if level else None,
                department.department_id if department else None,
                station.station_id if station else None
            )

            # Can schedule?
            can_schedule_retraining = (
                total_attempts_used < max_attempts
                and retraining_status != "failed"
            )

            # Performance gap
            obtained = evaluation.final_percentage or 0
            gap = required_percentage - obtained

            # Prepare response record
            record = {
                "employee_pk": employee.emp_id,
                "employee_id": employee.emp_id,
                "employee_name": f"{employee.first_name or ''} {employee.last_name or ''}".strip(),

                "department_id": department.department_id,
                "department_name": department.department_name,
                "station_id": station.station_id,
                "station_name": station.station_name,

                "level_id": level.level_id,
                "level_name": level.level_name,
                "evaluation_type": "10 Cycle",

                "obtained_percentage": round(obtained, 2),
                "required_percentage": required_percentage,
                "performance_gap": round(gap, 2),
                "last_evaluation_date": evaluation.date.isoformat(),
    
                # Normalized attempt fields
                # "existing_sessions_count": existing_sessions.count(),
                "existing_sessions_count": len(existing_sessions),
                "total_attempts_used": total_attempts_used,
                "max_attempts": max_attempts,

                "retraining_status": retraining_status,
                "can_schedule_retraining": can_schedule_retraining,

                "removed": False,  # Will update below

                "retraining_records": [
                    {
                        "id": session.id,
                        "attempt_no": session.attempt_no,
                        "scheduled_date": session.scheduled_date.isoformat(),
                        "scheduled_time": session.scheduled_time.strftime("%H:%M"),
                        "venue": session.venue,
                        "status": session.status,
                        "performance_percentage": session.performance_percentage,
                        "session_detail": {
                            "observations_failure_points": getattr(session.session_detail, "observations_failure_points", None),
                            "trainer_name": getattr(session.session_detail, "trainer_name", None),
                        } if hasattr(session, "session_detail") else None
                    }
                    for session in existing_sessions
                ]
            }

            # Mark removed if max attempts reached
            if not can_schedule_retraining:
                record["removed"] = True

            failed_employees.append(record)

        # Fetch all passed attempts for 10 Cycle to filter out failed attempts
        from .models import OperatorPerformanceEvaluation

        passed_attempts_qs = OperatorPerformanceEvaluation.objects.filter(
            final_status='Pass',
            is_completed=True,
            employee__emp_id__in=[emp['employee_id'] for emp in failed_employees],
            level__level_id__in=list(set(emp['level_id'] for emp in failed_employees)),
            department__department_id__in=list(set(emp['department_id'] for emp in failed_employees)),
            station__station_id__in=list(set(emp['station_id'] for emp in failed_employees)),
        ).values(
            'employee__emp_id', 'level__level_id', 'department__department_id', 'station__station_id'
        )

        passed_keys = set(
            (
                p['employee__emp_id'],
                p['department__department_id'],
                p['station__station_id'],
                p['level__level_id'],
                "10 Cycle"
            ) for p in passed_attempts_qs
        )

        # Deduplicate and filter results
        latest_failed = {}
        for emp in failed_employees:
            key = (
                emp['employee_id'],
                emp['department_id'],
                emp['station_id'],
                emp['level_id'],
                emp['evaluation_type'],
            )
            is_newer = (
                key not in latest_failed or
                (emp['total_attempts_used'] > latest_failed[key]['total_attempts_used']) or
                (
                    emp['total_attempts_used'] == latest_failed[key]['total_attempts_used'] and
                    emp['last_evaluation_date'] > latest_failed[key]['last_evaluation_date']
                )
            )
            retraining_completed = all(
                s['status'] == "Completed" for s in emp['retraining_records']
            ) if emp['retraining_records'] else False

            # Filter logic:
            # - skip if retraining completed and this is not newer
            # - skip if employee has passed (exclude)
            # - skip if max attempts reached and retraining status 'failed' (exclude)
            if (
                (not retraining_completed or is_newer) and
                (key not in passed_keys) and
                (not (emp.get('total_attempts_used', 0) >= emp.get('max_attempts', 2) and emp.get('retraining_status') == 'failed'))
            ):
                latest_failed[key] = emp

        # Finally, return filtered values
        return list(latest_failed.values())

    
    
    
    def _get_ojt_failed_employees(self):
        """Get failed OJT employees (correct attempt logic)."""
        failed_employees = []

        trainees = TraineeInfo.objects.filter(status='Fail')

        for trainee in trainees:
            trainee_score = trainee.scores.select_related(
                'topic__department', 'topic__level', 'day'
            ).first()

            if not trainee_score:
                continue

            department = trainee_score.topic.department
            level = trainee_score.topic.level
            day = trainee_score.day
            station = trainee.station

            # Passing Criteria
            criteria = (
               OJTPassingCriteria.objects.filter(department=department, level=level, day=day).first()
               or OJTPassingCriteria.objects.filter(department=department, level=level, day__isnull=True).first()
            )
            required_percentage = criteria.percentage if criteria else 60.0

            # Score calculation
            from django.db.models import Sum
            total_score = trainee.scores.aggregate(total=Sum("score"))["total"] or 0
            topic_count = trainee.scores.count()

            if topic_count > 0:
                score_range = OJTScoreRange.objects.filter(
                    department=department, level=level
                ).first()
                max_score = score_range.max_score if score_range else 5
                obtained_percentage = (total_score / (topic_count * max_score)) * 100
            else:
                obtained_percentage = 0

            # Match MasterTable
            try:
                employee = MasterTable.objects.get(emp_id=trainee.emp_id)
                employee_pk = employee.pk
            except MasterTable.DoesNotExist:
                employee = None
                employee_pk = None

            # If employee maps to master
            if employee:
                existing_sessions = RetrainingSession.objects.filter(
                    employee=employee,
                    level=level,
                    department=department,
                    station=station,
                    evaluation_type='OJT'
                ).select_related('session_detail').order_by('-attempt_no')

                retraining_count = existing_sessions.count()

                # Max attempts
                config = RetrainingConfig.objects.filter(
                    evaluation_type='OJT'
                ).first()
                max_attempts = config.max_count if config else 2

                # Correct logic: first attempt + retrainings
                total_attempts_used = 1 + retraining_count

                retraining_status = self._determine_retraining_status(
                    employee.emp_id,
                   'OJT',
                   level.level_id if level else None,
                   department.department_id if department else None,
                   station.station_id if station else None
                )

                can_schedule_retraining = (
                    total_attempts_used < max_attempts
                    and retraining_status != "failed"
                )
            else:
                existing_sessions = []
                max_attempts = 2  # default
                total_attempts_used = 1
                retraining_status = "not_mapped"
                can_schedule_retraining = False

            gap = required_percentage - obtained_percentage

            record = {
                "employee_pk": employee_pk,
                "employee_id": trainee.emp_id,
                "employee_name": trainee.trainee_name,

                "department_id": department.department_id,
                "department_name": department.department_name,

                "station_id": station.station_id if station else None,
                "station_name": station.station_name if station else "N/A",

                "level_id": level.level_id,
                "level_name": level.level_name,

                "evaluation_type": "OJT",
                "obtained_percentage": round(obtained_percentage, 2),
                "required_percentage": required_percentage,
                "performance_gap": round(gap, 2),
                "last_evaluation_date": trainee.created_at.isoformat() if trainee.created_at else None,

                # "existing_sessions_count": existing_sessions.count(),
                "existing_sessions_count": len(existing_sessions),
                "total_attempts_used": total_attempts_used,
                "max_attempts": max_attempts,

                "can_schedule_retraining": can_schedule_retraining,
                "retraining_status": retraining_status,

                "removed": False,

                "retraining_records": [
                    {
                        "id": session.id,
                        "attempt_no": session.attempt_no,
                        "scheduled_date": session.scheduled_date.isoformat(),
                        "scheduled_time": session.scheduled_time.strftime("%H:%M"),
                        "venue": session.venue,
                        "status": session.status,
                        "performance_percentage": session.performance_percentage,
                        "session_detail": {
                            "observations_failure_points": getattr(session.session_detail, "observations_failure_points", None),
                            "trainer_name": getattr(session.session_detail, "trainer_name", None),
                        } if hasattr(session, "session_detail") else None
                    }
                    for session in existing_sessions
                ]
            }

            if not can_schedule_retraining:
                record["removed"] = True

            failed_employees.append(record)

        # You had appended record twice before, remove the extra append; just keep this once before filtering:
        # failed_employees.append(record)  # REMOVE this line

        # Fetch all passed OJT attempts to filter out failed attempts
        # (TraineeInfo is already imported earlier in the scope)

        passed_attempts = TraineeInfo.objects.filter(
            status='Pass',
            emp_id__in=[emp['employee_id'] for emp in failed_employees]
        ).prefetch_related('scores__topic__department', 'scores__topic__level')
        
        passed_keys = set()
        for trainee_record in passed_attempts:
            first_score = trainee_record.scores.first()
            if first_score and first_score.topic:
                dept_id = first_score.topic.department.department_id if first_score.topic.department else None
                level_id = first_score.topic.level.level_id if first_score.topic.level else None
                station_ref = getattr(trainee_record, 'station', None)
                station_id = station_ref.station_id if station_ref else None
                passed_keys.add((
                    trainee_record.emp_id,
                    dept_id,
                    station_id,
                    level_id,
                    "OJT"
                ))

        # Deduplicate and filter results
        latest_failed = {}
        for emp in failed_employees:
            key = (
                emp['employee_id'],
                emp['department_id'],
                emp['station_id'],
                emp['level_id'],
                emp['evaluation_type'],
            )
            is_newer = (
                key not in latest_failed or
                (emp['total_attempts_used'] > latest_failed[key]['total_attempts_used']) or
                (
                    emp['total_attempts_used'] == latest_failed[key]['total_attempts_used'] and
                    emp['last_evaluation_date'] > latest_failed[key]['last_evaluation_date']
                )
            )
            retraining_completed = all(
                s['status'] == "Completed" for s in emp['retraining_records']
            ) if emp['retraining_records'] else False

            # Filter logic:
            # - skip if retraining completed and this is not newer
            # - skip if employee has passed (exclude)
            # - skip if max attempts reached and retraining status 'failed' (exclude)
            if (
                (not retraining_completed or is_newer) and
                (key not in passed_keys) and
                (not (emp.get('total_attempts_used', 0) >= emp.get('max_attempts', 2) and emp.get('retraining_status') == 'failed'))
            ):
                latest_failed[key] = emp

        # Finally, return filtered values
        return list(latest_failed.values())
    
    

    def _get_evaluation_failed_employees(self):
        """Get failed employees from Evaluation tests"""
        failed_employees = []
    
        failed_scores = Score.objects.filter(passed=False).select_related(
            'employee', 'level', 'skill', 'test'
        )
    
        for score in failed_scores:
            # ... (your existing checks for employee, level, department) ...
            if not score.employee or not score.level:
                continue
            
            department = score.department
            if not department:
                continue
        
            # ... (your existing criteria logic) ...
            criteria = EvaluationPassingCriteria.objects.filter(
                level=score.level,
                department=department
            ).first()
            required_percentage = float(criteria.percentage) if criteria else 80.0
        
            # ... (your existing sessions logic) ...
            existing_sessions = RetrainingSession.objects.filter(
                employee=score.employee,
                level=score.level,
                department=department,
                evaluation_type='Evaluation'
            ).select_related('session_detail').order_by('-attempt_no')
        
            config = RetrainingConfig.objects.filter(evaluation_type='Evaluation').first()
            max_attempts = config.max_count if config else 2

            # ... (your existing status logic) ...
            if existing_sessions.count() >= max_attempts:
                retraining_status = 'failed'
            elif existing_sessions.exists():
                retraining_status = 'scheduled' if existing_sessions.first().status == 'Scheduled' else 'pending'
            else:
                retraining_status = 'pending'
            gap = required_percentage - score.percentage

            # ✅ FIX PART 1: Calculate total_attempts_used
            # 1 original attempt + number of retraining sessions
            total_attempts_used = 1 + existing_sessions.count()
        
            failed_employees.append({
                'employee_pk': score.employee.emp_id,
                'employee_id': score.employee.emp_id,
                'employee_name': f"{score.employee.first_name or ''} {score.employee.last_name or ''}".strip(),
                'department_id': department.department_id,
                'department_name': department.department_name,
                'station_id': score.skill.station_id if score.skill else None,
                'station_name': score.skill.station_name if score.skill else 'N/A',
                'level_id': score.level.level_id,
                'level_name': score.level.level_name,
                'evaluation_type': 'Evaluation',
                'obtained_percentage': round(score.percentage, 2),
                'required_percentage': required_percentage,
                'performance_gap': round(gap, 2),
                'last_evaluation_date': score.created_at.date().isoformat(),
                
                "existing_sessions_count": existing_sessions.count(),
                
                # ✅ FIX PART 2: Add the missing key here
                "total_attempts_used": total_attempts_used, 
                
                'max_attempts': max_attempts,
                'can_schedule_retraining': existing_sessions.count() < max_attempts,
                'retraining_status': retraining_status,
                'retraining_records': [
                        # ... (your existing retraining records logic) ...
                        {
                           'id': session.id,
                           'attempt_no': session.attempt_no,
                           'scheduled_date': session.scheduled_date.isoformat(),
                           'scheduled_time': session.scheduled_time.strftime('%H:%M'),
                           'venue': session.venue,
                           'status': session.status,
                           'performance_percentage': session.performance_percentage,
                           'session_detail': {
                            'observations_failure_points': session.session_detail.observations_failure_points if hasattr(session, 'session_detail') else None,
                            'trainer_name': session.session_detail.trainer_name if hasattr(session, 'session_detail') else None,
                         } if hasattr(session, 'session_detail') else None
                        } for session in existing_sessions
                    ]
            })

        # ... (Rest of your function remains the same) ...
    
        # Get all passed scores keys to exclude these failed employees later
        passed_scores = Score.objects.filter(
            passed=True,
            employee__emp_id__in=[emp['employee_id'] for emp in failed_employees],
            level__level_id__in=list(set(emp['level_id'] for emp in failed_employees)),
            department__department_id__in=list(set(emp['department_id'] for emp in failed_employees)),
            skill__station_id__in=list(set(emp['station_id'] for emp in failed_employees)),
        ).values(
            'employee__emp_id', 'level__level_id', 'department__department_id', 'skill__station_id'
        )
    
        passed_keys = set(
            (
                p['employee__emp_id'],
                p['department__department_id'],
                p['skill__station_id'],
                p['level__level_id'],
                "Evaluation"
            ) for p in passed_scores
        )
    
        # Deduplicate and filter results
        latest_failed = {}
        for emp in failed_employees:
            key = (
                emp['employee_id'],
                emp['department_id'],
                emp['station_id'],
                emp['level_id'],
                emp['evaluation_type'],
            )
            is_newer = (
                key not in latest_failed or
                (emp['total_attempts_used'] > latest_failed[key].get('total_attempts_used', 0)) or
                # (emp.get('total_attempts_used', 0) > latest_failed[key].get('total_attempts_used', 0)) or
                (
                    emp['total_attempts_used'] == latest_failed[key].get('total_attempts_used', 0) and
                    emp['last_evaluation_date'] > latest_failed[key]['last_evaluation_date']
                )
            )
            retraining_completed = all(
                s['status'] == "Completed" for s in emp['retraining_records']
            ) if emp['retraining_records'] else False
        
            # Only show latest failed attempt; skip if retraining completed and next attempt exists
            # Also skip if employee has passed or if max attempts reached and failed
            if (
                (not retraining_completed or is_newer) and
                (key not in passed_keys) and
                (not (emp.get('total_attempts_used', 0) >= emp.get('max_attempts', 2) and emp.get('retraining_status') == 'failed'))
            ):
                latest_failed[key] = emp
    
        return list(latest_failed.values())


    

    
    
    def _determine_retraining_status(self, employee_id, evaluation_type, level_id, dept_id, station_id):
        """
        Determine retraining status purely based on session count and status.
        No use of performance_percentage.
        """

        sessions = RetrainingSession.objects.filter(
            employee_id=employee_id,
            evaluation_type=evaluation_type,
            level_id=level_id,
            department_id=dept_id,
            station_id=station_id
        ).order_by('-id')

        if not sessions.exists():
            return 'pending'  # No retraining done yet

        latest_session = sessions.first()
        total_attempts = sessions.count()

        # Get allowed attempts
        from .models import RetrainingConfig
        config = RetrainingConfig.objects.filter(evaluation_type=evaluation_type).first()
        max_attempts = config.max_count if config else 2

        # If scheduled
        if latest_session.status == 'Scheduled':
            return 'scheduled'

        # If completed
        if latest_session.status == 'Completed':
            if total_attempts < max_attempts:
                return 'Completed'      # retraining can continue
            else:
                return 'failed'       # max attempts reached

        # Default
        return 'pending'


    
    
    

    @action(detail=False, methods=['get'], url_path='summary')
    def get_summary(self, request):
        """Get summary statistics for retraining dashboard"""
        # Get all failed employees
        failed_response = self.get_failed_employees(request)
        all_failed = failed_response.data['results']
        
        # Calculate summary stats
        total_failed = len(all_failed)
        pending = len([emp for emp in all_failed if emp['retraining_status'] == 'pending'])
        scheduled = len([emp for emp in all_failed if emp['retraining_status'] == 'scheduled'])
        completed = len([emp for emp in all_failed if emp['retraining_status'] == 'completed'])
        failed = len([emp for emp in all_failed if emp['retraining_status'] == 'failed'])
        
        # Group by evaluation type
        by_evaluation_type = {}
        for emp in all_failed:
            eval_type = emp['evaluation_type']
            if eval_type not in by_evaluation_type:
                by_evaluation_type[eval_type] = {
                    'total': 0,
                    'pending': 0,
                    'scheduled': 0,
                    'completed': 0,
                    'failed': 0
                }
            by_evaluation_type[eval_type]['total'] += 1
            by_evaluation_type[eval_type][emp['retraining_status']] += 1
        
        # Group by department
        by_department = {}
        for emp in all_failed:
            dept_name = emp['department_name']
            if dept_name not in by_department:
                by_department[dept_name] = {
                    'total': 0,
                    'pending': 0,
                    'scheduled': 0,
                    'completed': 0,
                    'failed': 0
                }
            by_department[dept_name]['total'] += 1
            by_department[dept_name][emp['retraining_status']] += 1
        
        return Response({
            'overall_summary': {
                'total_failed_employees': total_failed,
                'pending_retraining': pending,
                'scheduled_retraining': scheduled,
                'completed_retraining': completed,
                'failed_retraining': failed
            },
            'by_evaluation_type': by_evaluation_type,
            'by_department': by_department
        })
        
    def get_current_attempt_number(self, employee_id, level_id, dept_id, station_id):
        from app1.models import (
            TraineeInfo,
            RetrainingSession,
            RetrainingSessionDetail,
            Station
        )

         # 1️⃣ Latest OJT attempt
        latest = TraineeInfo.objects.filter(
            emp_id=employee_id,
            station_id=station_id,
            level_id=level_id
        ).order_by("-attempt_no").first()

        # --> No records = Attempt 1
        if not latest:
            return 1

        # 2️⃣ If latest OJT is PASS → do NOT create new attempt
        if latest.status == "Pass":
            return latest.attempt_no

        # 3️⃣ Check retraining session exists for latest attempt
        retraining_exists = RetrainingSession.objects.filter(
            employee_id=employee_id,   # IMPORTANT FIX
            level_id=level_id,
            department_id=dept_id,
            station_id=station_id,
            status="Scheduled",
            evaluation_type="OJT",
            attempt_no=latest.attempt_no   # ensure it's for same attempt
        ).exists()

        # 4️⃣ Check retraining detail exists
        retraining_detail_exists = RetrainingSessionDetail.objects.filter(
            retraining_session__employee_id=employee_id,
            retraining_session__level_id=level_id,
            retraining_session__department_id=dept_id,
            retraining_session__station_id=station_id,
        ).exists()
        print("---- DEBUG START ----")
        print("Latest Attempt No:", latest.attempt_no)
        print("Latest Status:", latest.status)
        print("Employee:", employee_id)
        print("Level:", level_id)
        print("Department:", dept_id)
        print("Station:", station_id)
        print("Retraining Exists:", retraining_exists)
        print("Retraining Detail Exists:", retraining_detail_exists)
        print("---- DEBUG END ----")

        # 5️⃣ If FAIL + retraining session + detail = new attempt
        if (
            latest.status and latest.status.strip().lower() == "fail"
            and retraining_exists
            and retraining_detail_exists
        ):
            return latest.attempt_no + 1

        # Otherwise return same attempt
        return latest.attempt_no


    
    
    @action(detail=False, methods=['get'], url_path='current-attempt')
    def get_current_attempt(self, request):
        emp = request.GET.get("employee_id")
        lvl = request.GET.get("level_id")
        dept = request.GET.get("department_id")
        st = request.GET.get("station_id")

        if not (emp and lvl and dept and st):
            return Response({"error": "Missing parameters"}, status=400)

        attempt = self.get_current_attempt_number(emp, lvl, dept, st)

        return Response({"attempt_number": attempt})


    
# =================== Retraining end ============================= #








from rest_framework import viewsets
from .models import (
    QuantityScoreSetup,
    QuantityPassingCriteria,
    OJTLevel2Quantity,
    Level2QuantityOJTEvaluation,
)
from .serializers import (
    QuantityScoreSetupSerializer,
    QuantityPassingCriteriaSerializer,
    OJTLevel2QuantitySerializer,
    Level2QuantityOJTEvaluationSerializer,
)


# ----------------------------
# Quantity Score Ranges
# ----------------------------
from rest_framework import viewsets
from .models import QuantityScoreSetup
from .serializers import QuantityScoreSetupSerializer

class QuantityOJTScoreRangeViewSet(viewsets.ModelViewSet):
    serializer_class = QuantityScoreSetupSerializer

    def get_queryset(self):
        queryset = QuantityScoreSetup.objects.all()
        department = self.request.query_params.get("department")
        level = self.request.query_params.get("level")

        if department:
            queryset = queryset.filter(department=department)
        if level:
            queryset = queryset.filter(level=level)

        return queryset


# ----------------------------
# Quantity Passing Criteria
# ----------------------------
from rest_framework import viewsets
from .models import QuantityPassingCriteria
from .serializers import QuantityPassingCriteriaSerializer

class QuantityPassingCriteriaViewSet(viewsets.ModelViewSet):
    serializer_class = QuantityPassingCriteriaSerializer

    def get_queryset(self):
        queryset = QuantityPassingCriteria.objects.all()
        department = self.request.query_params.get("department")
        level = self.request.query_params.get("level")

        if department:
            try:
                queryset = queryset.filter(department=int(department))
            except ValueError:
                pass  # ignore invalid input

        if level:
            try:
                queryset = queryset.filter(level=int(level))
            except ValueError:
                pass  # ignore invalid input

        return queryset


# ----------------------------
# OJT Main Record (Trainee)
# ----------------------------

# ----------------------------
# Daily Evaluation
# ----------------------------
class Level2QuantityOJTEvaluationViewSet(viewsets.ModelViewSet):
    queryset = Level2QuantityOJTEvaluation.objects.all()
    serializer_class = Level2QuantityOJTEvaluationSerializer


from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AssessmentMode
from .serializers import AssessmentModeSerializer

@api_view(['GET'])
def get_assessment_mode(request):
    """Get current assessment mode"""
    current_mode = AssessmentMode.get_current_mode()
    return Response({
        'mode': current_mode.mode,
        'updated_at': current_mode.updated_at
    })

@api_view(['POST'])
def toggle_assessment_mode(request):
    """Toggle between quality and quantity mode"""
    mode = request.data.get('mode')
    
    if mode not in ['quality', 'quantity']:
        return Response({
            'error': 'Invalid mode. Must be "quality" or "quantity"'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    current_mode = AssessmentMode.get_current_mode()
    current_mode.mode = mode
    current_mode.save()
    
    return Response({
        'mode': current_mode.mode,
        'updated_at': current_mode.updated_at,
        'message': f'Mode switched to {mode}'
    })


from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LevelColour, Level
from .serializers import LevelColourSerializer

class LevelColourViewSet(viewsets.ModelViewSet):
    queryset = LevelColour.objects.all()
    serializer_class = LevelColourSerializer
    
    @action(detail=False, methods=['post'])
    def reset_to_defaults(self, request):
        """Reset all level colors to default values"""
        try:
            for level_id, color_code in DEFAULT_COLOURS.items():
                try:
                    level = Level.objects.get(level_id=level_id)
                    level_colour, created = LevelColour.objects.get_or_create(level=level)
                    level_colour.colour_code = color_code
                    level_colour.save()
                except Level.DoesNotExist:
                    continue
            
            # Return updated colors
            colours = LevelColour.objects.all()
            serializer = self.get_serializer(colours, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Update multiple level colors at once"""
        try:
            colors_data = request.data.get('colors', {})
            updated_colors = []
            
            for level_key, color_code in colors_data.items():
                # Extract level number from key like 'level1' -> 1
                level_num = int(level_key.replace('level', ''))
                
                try:
                    level = Level.objects.get(level_id=level_num)
                    level_colour, created = LevelColour.objects.get_or_create(level=level)
                    level_colour.colour_code = color_code
                    level_colour.save()
                    updated_colors.append(level_colour)
                except Level.DoesNotExist:
                    continue
            
            serializer = self.get_serializer(updated_colors, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import SkillMatrixDisplaySetting
from .serializers import SkillMatrixDisplaySettingSerializer

class SkillMatrixDisplaySettingViewSet(viewsets.ViewSet):
    """
    A simple ViewSet to get/set display shape.
    """

    def list(self, request):
        # Retrieve or create singleton instance
        setting, created = SkillMatrixDisplaySetting.objects.get_or_create(id=1)
        serializer = SkillMatrixDisplaySettingSerializer(setting)
        return Response(serializer.data)

    def update(self, request, pk=None):
        setting, created = SkillMatrixDisplaySetting.objects.get_or_create(id=1)
        serializer = SkillMatrixDisplaySettingSerializer(setting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DepartmentSubLineViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubLineSerializer
    
    def get_queryset(self):
        department_id = self.request.query_params.get('department_id')
        if department_id:
            return SubLine.objects.filter(line_department_department_id=department_id)
        return SubLine.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            department_id = request.query_params.get('department_id')
            
            if not department_id:
                response = Response(
                    {"error": "department_id parameter is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
                return response
            
            # Verify department exists
            try:
                department = Department.objects.get(department_id=department_id)
            except Department.DoesNotExist:
                response = Response(
                    {"error": "Department not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
                return response
            
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            response_data = {
                'department_id': department.department_id,
                'department_name': department.department_name,
                'sublines': serializer.data,
                'count': queryset.count()
            }
            
            response = Response(response_data, status=status.HTTP_200_OK)
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            
            return response
            
        except Exception as e:
            response = Response(
                {"error": "Failed to fetch sublines", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            return response


class DepartmentStationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StationSerializer
    
    def get_queryset(self):
        department_id = self.request.query_params.get('department_id')
        if department_id:
            return Station.objects.filter(subline_linedepartment_department_id=department_id)
        return Station.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            department_id = request.query_params.get('department_id')
            
            if not department_id:
                response = Response(
                    {"error": "department_id parameter is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
                return response
            
            # Verify department exists
            try:
                department = Department.objects.get(department_id=department_id)
            except Department.DoesNotExist:
                response = Response(
                    {"error": "Department not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
                return response
            
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            response_data = {
                'department_id': department.department_id,
                'department_name': department.department_name,
                'stations': serializer.data,
                'count': queryset.count()
            }
            
            response = Response(response_data, status=status.HTTP_200_OK)
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            
            return response
            
        except Exception as e:
            response = Response(
                {"error": "Failed to fetch stations", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            return response


from rest_framework import viewsets
from .models import CompanyLogo
from .serializers import CompanyLogoSerializer

class CompanyLogoViewSet(viewsets.ModelViewSet):
    queryset = CompanyLogo.objects.all()
    serializer_class = CompanyLogoSerializer


@api_view(['GET'])
def get_lines_by_department(request, department_id):
    department = get_object_or_404(Department, department_id=department_id)
    lines = Line.objects.filter(
        department=department_id
    ).select_related('department')
    
    if not lines.exists():
        return Response({
            'message': f'No lines found under department: {department.department_name}',
            'department_name': department.department_name,
            'lines': [],
            'total_count': 0
        }, status=status.HTTP_200_OK)
    
    serializer = LineReadSerializer(lines, many=True)
    
    return Response({
        'lines': serializer.data,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_sublines_by_line(request, line_id):
    # Check if line exists
    line = get_object_or_404(Line, line_id=line_id)
    
    # Get all sublines under this line
    sublines = SubLine.objects.filter(
        line=line_id
    ).select_related('line', 'line__department')
    
    if not sublines.exists():
        return Response({
            'message': f'No sublines found under line: {line.line_name}',
            'line_name': line.line_name,
            'department_name': line.department.department_name,
            'sublines': [],
            'total_count': 0
        }, status=status.HTTP_200_OK)
    
    serializer = SubLineReadSerializer(sublines, many=True)
    
    return Response({
        'line_id': line_id,
        'line_name': line.line_name,
        'sublines': serializer.data,
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_stations_by_subline(request, subline_id):
    
    # Check if subline exists
    subline = get_object_or_404(SubLine, subline_id=subline_id)
    
    # Get all stations under this subline
    stations = Station.objects.filter(
        subline=subline_id
    ).select_related('subline', 'subline__line', 'subline__line__department')
    
    if not stations.exists():
        return Response({
            'message': f'No stations found under subline: {subline.subline_name}',
            'subline_name': subline.subline_name,
            'line_name': subline.line.line_name,
            'department_name': subline.line.department.department_name,
            'stations': [],
            'total_count': 0
        }, status=status.HTTP_200_OK)
    
    serializer = StationReadSerializer(stations, many=True)
    
    return Response({
        'subline_id': subline_id,
        'subline_name': subline.subline_name,
        'stations': serializer.data,
    }, status=status.HTTP_200_OK)



@api_view(['GET'])
def get_stations_by_department(request, department_id):
    department = get_object_or_404(Department, department_id=department_id)
    
    # Get all stations under this department
    stations = Station.objects.filter(
        subline__line__department_id=department_id
    ).select_related('subline', 'subline__line', 'subline__line__department')
    
    if not stations.exists():
        return Response({
            'message': f'No stations found under department: {department.department_name}',
            'department_name': department.department_name,
            'stations': [],
            'total_count': 0
        }, status=status.HTTP_200_OK)
    
    serializer = StationReadSerializer(stations, many=True)
    
    return Response({
        'department_id': department_id,
        'department_name': department.department_name,
        'stations': serializer.data,
    }, status=status.HTTP_200_OK)



@api_view(['GET'])
def get_stations_by_line(request, line_id):
    
    line = get_object_or_404(Line, line_id=line_id)
    
    stations = Station.objects.filter(
        subline__line=line_id
    ).select_related('subline', 'subline__line', 'subline__line__department')
    
    if not stations.exists():
        return Response({
            'message': f'No stations found under line: {line.line_name}',
            'line_name': line.line_name,
            'department_name': line.department.department_name,
            'stations': [],
            'total_count': 0
        }, status=status.HTTP_200_OK)
    
    serializer = StationReadSerializer(stations, many=True)
    
    return Response({
        'line_id': line_id,
        'line_name': line.line_name,
        'stations': serializer.data,
    }, status=status.HTTP_200_OK)


from rest_framework.decorators import api_view

@api_view(['GET'])
def get_all_departments(request):
    departments = Department.objects.all()
    serializer = DepartmentReadSerializer(departments, many=True)
    return Response({
        'departments': serializer.data,
    }, status=status.HTTP_200_OK)





# ----------------------------------notification--------------------------#
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, BasePermission
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import Notification
from .serializers import (
    NotificationSerializer, NotificationCreateSerializer,
    NotificationUpdateSerializer, NotificationStatsSerializer
)


class NotificationPermission(BasePermission):
    """
    Custom permission for notifications:
    - Allow read access without authentication (for testing)
    - Require authentication for write operations
    """
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications - no authentication required for read
    """
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Notification.objects.all().select_related(
            'recipient', 'employee', 'level', 'training_schedule',
            'machine_allocation', 'test_session', 'retraining_session',
            'human_body_check_session'
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return NotificationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return NotificationUpdateSerializer
        return NotificationSerializer
    

    def list(self, request, *args, **kwargs):
        logger.info(f"Received request for notifications with params: {request.query_params}")
        queryset = self.get_queryset()

        is_read = request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')

        notification_types = request.query_params.getlist('notification_type')
        if notification_types:
            queryset = queryset.filter(notification_type__in=notification_types)

        notification_type = request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        priority = request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)

        days = request.query_params.get('days')
        if days:
            try:
                days_int = int(days)
                since_date = timezone.now() - timedelta(days=days_int)
                queryset = queryset.filter(created_at__gte=since_date)
            except ValueError:
                logger.warning(f"Invalid days parameter: {days}")

        queryset = queryset.order_by('-created_at')
        logger.info(f"Returning {queryset.count()} notifications")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        notification = self.get_object()
        notification.mark_as_unread()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        queryset = self.get_queryset().filter(is_read=False)
        count = queryset.count()
        for notification in queryset:
            notification.mark_as_read()
        return Response({'message': f'Marked {count} notifications as read', 'count': count})

    @action(detail=False, methods=['get'])
    def unread(self, request):
        queryset = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()
        total_count = queryset.count()
        unread_count = queryset.filter(is_read=False).count()
        read_count = total_count - unread_count
        recent_count = queryset.filter(created_at__gte=timezone.now() - timedelta(hours=24)).count()
        by_type = dict(queryset.values('notification_type').annotate(count=Count('id')).values_list('notification_type', 'count'))
        by_priority = dict(queryset.values('priority').annotate(count=Count('id')).values_list('priority', 'count'))

        stats_data = {
            'total_count': total_count,
            'unread_count': unread_count,
            'read_count': read_count,
            'recent_count': recent_count,
            'by_type': by_type,
            'by_priority': by_priority
        }
        serializer = NotificationStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        since_date = timezone.now() - timedelta(hours=24)
        queryset = self.get_queryset().filter(created_at__gte=since_date)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ==================== API FUNCTION VIEWS ====================

@api_view(['GET'])
def notification_count(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    count = Notification.objects.filter(
        Q(recipient=request.user) | Q(recipient_email=request.user.email),
        is_read=False
    ).count()
    return Response({'unread_count': count})


@api_view(['GET'])
def test_notifications(request):
    notifications = Notification.objects.all()[:10]
    serializer = NotificationSerializer(notifications, many=True)
    return Response({'count': notifications.count(), 'notifications': serializer.data, 'debug': 'This is a test endpoint'})


@api_view(['POST'])
def create_system_notification(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_403_FORBIDDEN)

    serializer = NotificationCreateSerializer(data=request.data)
    if serializer.is_valid():
        notification = serializer.save()
        response_serializer = NotificationSerializer(notification)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_test_notification(request):
    try:
        recipient = request.user if request.user.is_authenticated else None
        notification = Notification.objects.create(
            title="Test Notification",
            message="This is a test notification to verify the system is working.",
            notification_type="system_alert",
            recipient=recipient,
            priority="medium",
            metadata={"test": True}
        )
        serializer = NotificationSerializer(notification)
        return Response({'message': 'Test notification created successfully', 'notification': serializer.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def trigger_employee_notification(request):
    try:
        recipient = request.user if request.user.is_authenticated else None
        latest_employee = MasterTable.objects.last()

        if not latest_employee:
            return Response({'error': 'No employees found in the system'}, status=status.HTTP_400_BAD_REQUEST)

        notification = Notification.objects.create(
            title="New Employee Registered",
            message=f"New employee {latest_employee.first_name} {latest_employee.last_name} (Employee ID: {latest_employee.emp_id}) has been registered.",
            notification_type='employee_registration',
            recipient=recipient,
            employee=latest_employee,
            priority='medium',
            metadata={
                'emp_id': latest_employee.emp_id,
                'department': latest_employee.department.department_name if latest_employee.department else None
            }
        )
        serializer = NotificationSerializer(notification)
        return Response({'message': 'Employee notification created', 'notification': serializer.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def trigger_all_notification_types(request):
    try:
        recipient = request.user if request.user.is_authenticated else None
        latest_employee = MasterTable.objects.last()
        employee_name = f"{latest_employee.first_name} {latest_employee.last_name}" if latest_employee else "Test Employee"

        notification_types = [
            {'type': 'employee_registration', 'title': 'New Employee Registered', 'message': f'{employee_name} has been registered.', 'priority': 'medium'},
            {'type': 'level_exam_completed', 'title': 'Level Exam Completed', 'message': f'{employee_name} completed Level 2 evaluation.', 'priority': 'high'},
            {'type': 'training_scheduled', 'title': 'Training Scheduled', 'message': f'Training scheduled for {employee_name}.', 'priority': 'medium'},
            {'type': 'training_completed', 'title': 'Training Completed', 'message': f'{employee_name} completed training.', 'priority': 'medium'},
            {'type': 'training_reschedule', 'title': 'Training Rescheduled', 'message': f'Training for {employee_name} rescheduled.', 'priority': 'medium'},
            {'type': 'refresher_training_scheduled', 'title': 'Refresher Training Scheduled', 'message': f'Refresher training scheduled for {employee_name}.', 'priority': 'medium'},
            {'type': 'refresher_training_completed', 'title': 'Refresher Training Completed', 'message': f'{employee_name} completed refresher training.', 'priority': 'medium'},
            {'type': 'hanchou_exam_completed', 'title': 'Hanchou Exam Completed', 'message': f'{employee_name} completed Hanchou exam.', 'priority': 'high'},
            {'type': 'shokuchou_exam_completed', 'title': 'Shokuchou Exam Completed', 'message': f'{employee_name} completed Shokuchou exam.', 'priority': 'high'},
            {'type': 'ten_cycle_evaluation_completed', 'title': '10 Cycle Evaluation Completed', 'message': f'{employee_name} completed 10 Cycle evaluation.', 'priority': 'high'},
            {'type': 'ojt_completed', 'title': 'OJT Completed', 'message': f'{employee_name} completed OJT.', 'priority': 'medium'},
            {'type': 'ojt_quantity_completed', 'title': 'OJT Quantity Completed', 'message': f'{employee_name} completed OJT Quantity evaluation.', 'priority': 'medium'},
            {'type': 'machine_allocated', 'title': 'Machine Allocated', 'message': f'Machine allocated to {employee_name}.', 'priority': 'medium'},
            {'type': 'test_assigned', 'title': 'Test Assigned', 'message': f'Test assigned to {employee_name}.', 'priority': 'medium'},
            {'type': 'evaluation_completed', 'title': 'Evaluation Completed', 'message': f'{employee_name} completed an evaluation.', 'priority': 'high'},
            {'type': 'retraining_scheduled', 'title': 'Retraining Scheduled', 'message': f'Retraining scheduled for {employee_name}.', 'priority': 'medium'},
            {'type': 'retraining_completed', 'title': 'Retraining Completed', 'message': f'{employee_name} completed retraining.', 'priority': 'medium'},
            {'type': 'human_body_check_completed', 'title': 'Human Body Check Completed', 'message': f'{employee_name} completed human body check.', 'priority': 'medium'},
            {'type': 'milestone_reached', 'title': 'Milestone Reached', 'message': f'{employee_name} reached a milestone.', 'priority': 'high'},
            {'type': 'system_alert', 'title': 'System Alert', 'message': 'System maintenance at 2:00 AM.', 'priority': 'urgent'}
        ]

        created_notifications = []
        for notif_data in notification_types:
            n = Notification.objects.create(
                title=notif_data['title'],
                message=notif_data['message'],
                notification_type=notif_data['type'],
                recipient=recipient,
                employee=latest_employee if latest_employee else None,
                priority=notif_data['priority'],
                metadata={'test': True, 'employee': employee_name}
            )
            created_notifications.append(n)

        return Response({'message': f'Created {len(created_notifications)} notifications', 'count': len(created_notifications)}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_all_notifications(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        deleted_count = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient_email=request.user.email)
        ).delete()[0]
        return Response({'message': f'Deleted {deleted_count} notifications', 'count': deleted_count}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .serializers import LevelOnePassedScoreSerializer 

class LevelOnePassedUsersView(generics.ListAPIView):
    """
    API view to retrieve a list of all scores for users who have 
    successfully passed a 'Level 1' assessment.

    The results are ordered by the most recent test date first.
    """
    serializer_class = LevelOnePassedScoreSerializer
    
    def get_queryset(self):
        """
        This view returns a list of all scores for
        users who have passed a test specifically at 'Level 1'.
        """
        queryset = Score.objects.filter(
            passed=True,
            level__level_name='Level 1'  # <-- CORRECTED LOOKUP HERE
        ).select_related(
            'employee', 'test', 'level', 'skill'
        ).order_by('-created_at')
        
        return queryset
    

# In views.py
from .models import HandoverSheet
from .serializers import HandoverSheetCreateSerializer


class HandoverSheetViewSet(viewsets.ModelViewSet):
    queryset = HandoverSheet.objects.all()
    serializer_class = HandoverSheetCreateSerializer



from django.shortcuts import get_object_or_404

class EmployeeHandoverView(generics.RetrieveUpdateAPIView):
    serializer_class = HandoverSheetCreateSerializer
    queryset = HandoverSheet.objects.all()

    lookup_field = "employee__emp_id"  # tell DRF to look up by emp_id
    lookup_url_kwarg = "emp_id"




from datetime import datetime, timedelta 
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from datetime import datetime
from django.db.models import Q
import calendar
from django.db.models import Sum, Avg, F
from django.db.models.functions import Coalesce

# Make sure to import your model and serializer
from .models import DailyProductionData
from .serializers import DailyProductionDataSerializer

class DailyProductionDataViewSet(viewsets.ModelViewSet):
    """
    Final, correct ViewSet for handling production data.
    All calculation logic is now handled here, not in signals.
    """
    queryset = DailyProductionData.objects.all()
    serializer_class = DailyProductionDataSerializer

    def get_queryset(self):
        """
        Overrides the default queryset to apply filters from URL parameters.
        """
        # Start with all objects
        queryset = super().get_queryset()

        # Get parameters from the URL
        factory_id = self.request.query_params.get('factory')
        department_id = self.request.query_params.get('department')

        # Apply filters if the parameters exist
        if factory_id:
            queryset = queryset.filter(factory_id=factory_id)

        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        # Return the final, correctly filtered data
        return queryset

    @action(detail=False, methods=['post'], url_path='save-plan-entry')
    @transaction.atomic
    def save_plan_entry(self, request):
        """
        Handles creating or updating a plan entry.
        It now performs all calculations itself, ignoring the pre_save signal.
        """
        data = request.data
        entry_id = data.get('id', None)

        try:
            # Step 1: Calculate all the totals into a separate dictionary
            # This is safer and doesn't modify the original request data.
            calculated_totals = {}
            calculated_totals['ctq_plan_total'] = data.get('ctq_plan_l1', 0) + data.get('ctq_plan_l2', 0) + data.get('ctq_plan_l3', 0) + data.get('ctq_plan_l4', 0)
            calculated_totals['ctq_actual_total'] = data.get('ctq_actual_l1', 0) + data.get('ctq_actual_l2', 0) + data.get('ctq_actual_l3', 0) + data.get('ctq_actual_l4', 0)
            calculated_totals['pdi_plan_total'] = data.get('pdi_plan_l1', 0) + data.get('pdi_plan_l2', 0) + data.get('pdi_plan_l3', 0) + data.get('pdi_plan_l4', 0)
            calculated_totals['pdi_actual_total'] = data.get('pdi_actual_l1', 0) + data.get('pdi_actual_l2', 0) + data.get('pdi_actual_l3', 0) + data.get('pdi_actual_l4', 0)
            calculated_totals['other_plan_total'] = data.get('other_plan_l1', 0) + data.get('other_plan_l2', 0) + data.get('other_plan_l3', 0) + data.get('other_plan_l4', 0)
            calculated_totals['other_actual_total'] = data.get('other_actual_l1', 0) + data.get('other_actual_l2', 0) + data.get('other_actual_l3', 0) + data.get('other_actual_l4', 0)
            calculated_totals['grand_total_plan'] = calculated_totals['ctq_plan_total'] + calculated_totals['pdi_plan_total'] + calculated_totals['other_plan_total']
            calculated_totals['grand_total_actual'] = calculated_totals['ctq_actual_total'] + calculated_totals['pdi_actual_total'] + calculated_totals['other_actual_total']

            # Step 2: Perform the overlap check
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            entry_mode = data['entry_mode']
            
            overlap_condition = Q(start_date__lte=end_date) & Q(end_date__gte=start_date)
            # filters = {'line_id': data.get('line'), 'station_id': data.get('station'), 'shop_floor_id': data.get('shop_floor'), 'factory_id': data.get('factory')}
            filters = {
                'Hq_id': data.get('Hq'),
                'factory_id': data.get('factory'),
                'department_id': data.get('department'),
                'line_id': data.get('line'),
                'subline_id': data.get('subline'),
                'station_id': data.get('station'),
            }
            filters = {k: v for k, v in filters.items() if v}
            overlapping_entries = DailyProductionData.objects.filter(overlap_condition, **filters)

            if entry_id:
                overlapping_entries = overlapping_entries.exclude(id=entry_id)

            if overlapping_entries.exists():
                existing_entry = overlapping_entries.first()
                if entry_mode == 'MONTHLY' and existing_entry.entry_mode != 'MONTHLY':
                    return Response({'error': "Cannot save: Weekly/Daily data already exists in this period."}, status=status.HTTP_409_CONFLICT)
                if entry_mode != 'MONTHLY' and existing_entry.entry_mode == 'MONTHLY':
                    return Response({'error': f"Cannot save: A Monthly entry already exists for this period."}, status=status.HTTP_409_CONFLICT)

            # Step 3: Serialize and Save
            if entry_id:
                instance = DailyProductionData.objects.get(id=entry_id)
                serializer = self.get_serializer(instance, data=data, partial=True)
            else:
                serializer = self.get_serializer(data=data)
            
            serializer.is_valid(raise_exception=True)
            # Pass the calculated totals as extra arguments to the save method
            saved_instance = serializer.save(**calculated_totals)
            
            # Create a new serializer from the final saved object to send back
            response_serializer = self.get_serializer(saved_instance)
            return Response(response_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        


        # In views.py, add this method inside the DailyProductionDataViewSet class

    

    # --- ADD THIS ENTIRE NEW FUNCTION FOR THE WEEKLY VIEW ---
    @action(detail=False, methods=['get'], url_path='weekly-summary')
    def weekly_summary(self, request):
        """
        NOTE: This function aggregates all data for an entire MONTH, not a single week.
        It fetches level-based data for a given factory, year, and month.
        """
        # --- 1. Get Parameters ---
        factory_id = request.query_params.get('factory')
        month_str = request.query_params.get('month')
        year_str = request.query_params.get('year')

        line_id = request.query_params.get('line')
        station_id = request.query_params.get('station')
        # --- ADD THESE LINES ---
        Hq_id = request.query_params.get('Hq')
        department_id = request.query_params.get('department')
        subline_id = request.query_params.get('subline')

        if not all([factory_id, month_str, year_str]):
            return Response(
                {'error': 'factory, month, and year are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # --- 2. Build Filters ---
        filters = {}
        try:
            # Handle specific week if provided, otherwise aggregate for the month
            start_date_param = request.query_params.get('start_date')
            if start_date_param and start_date_param != 'null' and start_date_param != 'undefined':
                filters['start_date'] = start_date_param
            else:
                # Use month/year range
                target_month = int(month_str)
                target_year = int(year_str)
                filters['start_date__year'] = target_year
                filters['start_date__month'] = target_month

            # Standardize parameters, cast to int, and cleanup 'all'
            def parse_id(val):
                if not val or val in ['all', 'null', 'undefined', 'Select HQ', 'Select Factory', 'Select Department', 'Select Line', 'Select Subline', 'Select Station']:
                    return None
                try:
                    return int(val)
                except (ValueError, TypeError):
                    return None

            hq_id = parse_id(request.query_params.get('hq') or request.query_params.get('Hq'))
            dept_id = parse_id(request.query_params.get('department'))
            line_id = parse_id(request.query_params.get('line'))
            subline_id = parse_id(request.query_params.get('subline'))
            station_id = parse_id(request.query_params.get('station'))
            fact_id = parse_id(factory_id)

            filters['factory_id'] = fact_id
            if hq_id: filters['Hq_id'] = hq_id
            if dept_id: filters['department_id'] = dept_id
            if subline_id: filters['subline_id'] = subline_id
            
            if station_id:
                filters['station_id'] = station_id
            elif line_id:
                filters['line_id'] = line_id
            
            pass
                    
        except (ValueError, TypeError):
            return Response({'error': 'Invalid year or month format.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 3. Define Aggregation Fields (Corrected to be a DICTIONARY) ---
        aggregation_fields = {}
        field_names_to_sum = [
            'ctq_plan_l1', 'ctq_actual_l1', 'pdi_plan_l1', 'pdi_actual_l1', 'other_plan_l1', 'other_actual_l1',
            'ctq_plan_l2', 'ctq_actual_l2', 'pdi_plan_l2', 'pdi_actual_l2', 'other_plan_l2', 'other_actual_l2',
            'ctq_plan_l3', 'ctq_actual_l3', 'pdi_plan_l3', 'pdi_actual_l3', 'other_plan_l3', 'other_actual_l3',
            'ctq_plan_l4', 'ctq_actual_l4', 'pdi_plan_l4', 'pdi_actual_l4', 'other_plan_l4', 'other_actual_l4'
        ]
        for field in field_names_to_sum:
            aggregation_fields[field] = Sum(field)

        # --- 4. Perform Aggregation ---
        summary_data = DailyProductionData.objects.filter(**filters).aggregate(**aggregation_fields)
        
        # Clean up None values to 0 for frontend safety
        for key in summary_data:
            if summary_data[key] is None:
                summary_data[key] = 0

        # Debug: if all are zero, return filters too
        is_empty = all(v == 0 for v in summary_data.values())
        if is_empty:
            summary_data['_debug_filters'] = {k: str(v) for k, v in filters.items()}
            summary_data['_debug_count'] = DailyProductionData.objects.filter(**filters).count()
            # Also check if just the date filter matches anything
            date_only_count = DailyProductionData.objects.filter(start_date=filters.get('start_date')).count()
            summary_data['_debug_date_only_count'] = date_only_count

        return Response(summary_data, status=status.HTTP_200_OK)
        


    @action(detail=False, methods=['get'], url_path='trend-data')
    def trend_data(self, request):
        """
        A flexible endpoint to return trend data for different metrics.
        Accepts a 'data_key' to switch between production, manpower, etc.
        Groups data by 'monthly', 'weekly', or 'daily'.
        """
        # --- 1. Get Parameters ---
        factory_id = request.query_params.get('factory')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        group_by = request.query_params.get('group_by')
        data_key = request.query_params.get('data_key', 'production')

        if not all([factory_id, start_date_str, end_date_str, group_by]):
            return Response({'error': 'Required parameters missing'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 2. Determine which fields to aggregate based on data_key ---
        if data_key == 'production':
            plan_field = 'total_production_plan'
            actual_field = 'total_production_actual'
        elif data_key == 'manpower':
            plan_field = 'total_operators_required_plan'
            actual_field = 'total_operators_required_actual'
        else:
            return Response({'error': 'Invalid data_key'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 3. Build Filters and get the base queryset ---
        filters = {
            'factory_id': factory_id,
            'start_date__lte': end_date,
            'end_date__gte': start_date,
        }
        
        # Standardize hierarchy parameters, cast to int, and cleanup 'all'
        def parse_id(val):
            if not val or val in ['all', 'null', 'undefined', 'Select HQ', 'Select Factory', 'Select Department', 'Select Line', 'Select Subline', 'Select Station']:
                return None
            try:
                return int(val)
            except (ValueError, TypeError):
                return None

        hq_id = parse_id(request.query_params.get('hq') or request.query_params.get('Hq'))
        dept_id = parse_id(request.query_params.get('department'))
        line_id = parse_id(request.query_params.get('line'))
        subline_id = parse_id(request.query_params.get('subline'))
        station_id = parse_id(request.query_params.get('station'))
        fact_id = parse_id(factory_id)

        filters = {
            'factory_id': fact_id,
            'start_date__lte': end_date,
            'end_date__gte': start_date,
        }

        if hq_id: filters['Hq_id'] = hq_id
        if dept_id: filters['department_id'] = dept_id
        if line_id: filters['line_id'] = line_id
        if subline_id: filters['subline_id'] = subline_id
        if station_id: filters['station_id'] = station_id

        queryset = DailyProductionData.objects.filter(**filters)
        trend_data = []

        # --- 4. Aggregate and format data ---
        if group_by == 'monthly':
            for year in range(start_date.year, end_date.year + 1):
                for month in range(1, 13):
                    if (year == start_date.year and month < start_date.month) or \
                    (year == end_date.year and month > end_date.month):
                        continue
                    
                    aggregation = queryset.filter(start_date__year=year, start_date__month=month).aggregate(
                        plan_sum=Sum(plan_field),
                        actual_sum=Sum(actual_field)
                    )
                    trend_data.append({
                        "name": f"{calendar.month_name[month][:3]} '{str(year)[2:]}",
                        "planned": aggregation['plan_sum'] or 0,
                        "actual": aggregation['actual_sum'] or 0,
                    })

        elif group_by == 'weekly':
            # Find all unique weekly records within the date range and return them.
            # We fetch a slightly wider range to catch weeks that start in the previous month but have a midpoint here.
            search_start = start_date - timedelta(days=4)
            search_end = end_date
            
            weekly_records = DailyProductionData.objects.filter(
                **{k: v for k, v in filters.items() if k not in ['start_date__lte', 'end_date__gte']}
            ).filter(
                entry_mode='WEEKLY',
                start_date__lte=search_end,
                start_date__gte=search_start
            ).order_by('start_date')
            
            for record in weekly_records:
                # Same midpoint logic as weekly-summary
                start_dt = record.start_date
                mid = start_dt + timedelta(days=3) # Wednesday midpoint
                
                # Check if midpoint falls within the requested range
                if mid < start_date or mid > end_date:
                    continue
                    
                mid_month = mid.month
                mid_month_name = calendar.month_name[mid_month]
                
                # Calculate week number relative to mid_month (Sunday-based)
                month_first = mid.replace(day=1)
                # Sunday of the week containing the 1st
                first_sunday = month_first - timedelta(days=(month_first.weekday() + 1) % 7)
                
                # If Wednesday of that week is not in mid_month, move to the next Sunday
                if (first_sunday + timedelta(days=3)).month != mid_month:
                    first_sunday += timedelta(days=7)
                
                week_num = (mid - (first_sunday + timedelta(days=3))).days // 7 + 1
                
                trend_data.append({
                    "name": f"{mid_month_name} Week {week_num}",
                    "planned": getattr(record, plan_field) or 0,
                    "actual": getattr(record, actual_field) or 0,
                })
        
        # (The 'daily' grouping is omitted as the frontend is no longer asking for it, but can be added back if needed)
        
        return Response(trend_data, status=status.HTTP_200_OK)

    

    @action(detail=False, methods=['get'], url_path='get-plan-data')
    def get_plan_data(self, request):
        factory_id = request.query_params.get('factory')
        Hq_id = request.query_params.get('Hq')
        department_id = request.query_params.get('department')
        subline_id = request.query_params.get('subline')
        line_id = request.query_params.get('line')
        station_id = request.query_params.get('station')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not all([factory_id, start_date_str, end_date_str]):
            return Response({'error': 'Factory, start_date, and end_date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        
        filters = {
            'Hq_id': Hq_id,
            'factory_id': factory_id,
            'department_id': department_id,
            'line_id': line_id,
            'subline_id': subline_id,
            'station_id': station_id,
            'start_date': start_date,
            'end_date': end_date,
        }
        # Clean up 'all' but ALLOW None (None means Top-level or Line-level)
        filters = {k: v for k, v in filters.items() if v != 'all'}
        
        try:
            plan_entry = DailyProductionData.objects.get(**filters)
            serializer = self.get_serializer(plan_entry)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except DailyProductionData.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'No data found for the selected period'
            }, status=status.HTTP_404_NOT_FOUND)
        except DailyProductionData.MultipleObjectsReturned:
            return Response({'error': 'Multiple entries found for this period. Please ensure unique data for the specified dates.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

    @action(detail=False, methods=['get'], url_path='get-ending-team')
    def get_ending_team(self, request):
            """
            Calculates the ending team for a given period to be used as the
            starting team for the next period.
            """
            factory_id = request.query_params.get('factory')
            Hq_id = request.query_params.get('Hq')
            department_id = request.query_params.get('department')
            subline_id = request.query_params.get('subline')

            # shop_floor_id = request.query_params.get('shop_floor')
            line_id = request.query_params.get('line')
            station_id = request.query_params.get('station')
            # We will ask for the START date of the *previous* period
            target_date_str = request.query_params.get('target_date')

            if not all([factory_id, target_date_str]):
                return Response({'error': 'Factory and target_date are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format.'}, status=status.HTTP_400_BAD_REQUEST)
                
            filters = {
                'Hq_id': Hq_id,
                'factory_id': factory_id,
                'department_id': department_id,
                'line_id': line_id,
                'subline_id': subline_id,
                'station_id': station_id,
                'start_date__lte': target_date, 'end_date__gte': target_date,
            }
            # Clean up 'all' but ALLOW None (None means Top-level or Line-level)
            filters = {k: v for k, v in filters.items() if v != 'all'}
            
            try:
                previous_entry = DailyProductionData.objects.get(**filters)
                
                # Perform the 'Ending Team' calculation
                starting_team = previous_entry.total_operators_available
                attrition_rate = previous_entry.attrition_rate
                
                # Use Decimal for precision
                from decimal import Decimal
                ending_team = Decimal(starting_team) * (Decimal(1) - (Decimal(attrition_rate) / Decimal(100)))
                
                # Return the calculated value, rounded to a whole number
                return Response({'ending_team': round(ending_team)}, status=status.HTTP_200_OK)
                
            except DailyProductionData.DoesNotExist:
                # If there's no previous data, we can't calculate, so we return 0
                return Response({'ending_team': 0}, status=status.HTTP_404_NOT_FOUND)
            

    @action(detail=False, methods=['get'], url_path='get-month-lock-status')
    def get_month_lock_status(self, request):
        factory_id = request.query_params.get('factory')
        target_date_str = request.query_params.get('target_date')

        Hq_id = request.query_params.get('Hq')
        department_id = request.query_params.get('department')
        line_id = request.query_params.get('line')
        subline_id = request.query_params.get('subline')
        station_id = request.query_params.get('station')

        if not target_date_str:
            return Response({'error': 'target_date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Ensure 'datetime' is imported as 'from datetime import datetime'
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
            month = target_date.month
            year = target_date.year
        except ValueError:
            # Only catch format errors here
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # For debugging: print the actual system error (like NameError) to console
            print(f"System Error in get_month_lock_status: {e}") 
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        filters = {
            'factory_id': factory_id,
        }
        if Hq_id: filters['Hq_id'] = Hq_id
        if department_id: filters['department_id'] = department_id
        if line_id: filters['line_id'] = line_id
        if subline_id: filters['subline_id'] = subline_id
        if station_id: filters['station_id'] = station_id

        filters['start_date__year'] = year
        filters['start_date__month'] = month

        # Clean up 'all' but ALLOW None (None means Top-level or Line-level)
        filters = {k: v for k, v in filters.items() if v != 'all'}
        
        first_entry = DailyProductionData.objects.filter(**filters).first()
        
        if first_entry:
            return Response({'lock_mode': first_entry.entry_mode}, status=status.HTTP_200_OK)
        else:
            # Important to send 200 OK with null, so frontend knows the check was successful
            return Response({'lock_mode': None}, status=status.HTTP_200_OK)
        

    @action(detail=False, methods=['get'], url_path='get-period-summary')
    def get_period_summary(self, request):
        """
        This is our "Summary Chef".
        It aggregates all data for a specific period (month or week)
        to power the summary cards and stats components.
        """
        # --- 1. Get all the filter parameters from the control panel ---
        factory_id = request.query_params.get('factory')
        # shop_floor_id = request.query_params.get('shop_floor')
        Hq_id = request.query_params.get('Hq')
        department_id = request.query_params.get('department')
        subline_id = request.query_params.get('subline')
        line_id = request.query_params.get('line')
        station_id = request.query_params.get('station')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not all([factory_id, start_date_str, end_date_str]):
            return Response(
                {'error': 'Factory, start_date, and end_date are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- 2. Build the filter dictionary dynamically ---
        # This correctly handles the "All" selections from the frontend.
        filters = {
            'factory_id': factory_id,
            # Find any record that overlaps with the selected date range
            'start_date__lte': end_date,
            'end_date__gte': start_date,
        }
        if Hq_id and Hq_id != 'all':
            filters['Hq_id'] = Hq_id
        if department_id and department_id != 'all':
            filters['department_id'] = department_id
        if subline_id and subline_id != 'all':
            filters['subline_id'] = subline_id
        if line_id and line_id != 'all':
            filters['line_id'] = line_id
        if station_id and station_id != 'all':
            filters['station_id'] = station_id
        # --- 3. Define all the fields we need to aggregate (Sum or Average) ---
        from django.db.models import Sum, Avg

        aggregation_fields = {
            # Main Totals
            'total_production_plan': Sum('total_production_plan'),
            'total_production_actual': Sum('total_production_actual'),
            'total_operators_available': Sum('total_operators_available'),
            'total_operators_required_plan': Sum('total_operators_required_plan'),
            'total_operators_required_actual': Sum('total_operators_required_actual'),
            # Rates should be averaged
            'attrition_rate': Avg('attrition_rate'),
            'absenteeism_rate': Avg('absenteeism_rate'),
            # Bifurcation fields
            'bifurcation_plan_l1': Sum('bifurcation_plan_l1'),
            'bifurcation_actual_l1': Sum('bifurcation_actual_l1'),
            'bifurcation_plan_l2': Sum('bifurcation_plan_l2'),
            'bifurcation_actual_l2': Sum('bifurcation_actual_l2'),
            'bifurcation_plan_l3': Sum('bifurcation_plan_l3'),
            'bifurcation_actual_l3': Sum('bifurcation_actual_l3'),
            'bifurcation_plan_l4': Sum('bifurcation_plan_l4'),
            'bifurcation_actual_l4': Sum('bifurcation_actual_l4'),
            # You can add all your CTQ, PDI, Other fields here if needed for stats
        }

        # --- 4. Perform the database query ---
        summary_data = DailyProductionData.objects.filter(**filters).aggregate(**aggregation_fields)

        # --- 5. Clean up the data and send the response ---
        # If the query finds nothing, aggregate returns None for all fields.
        # We need to replace None with 0 so the frontend doesn't crash.
        for key, value in summary_data.items():
            if value is None:
                summary_data[key] = 0
        
        return Response(summary_data, status=status.HTTP_200_OK)
    

    # Add this code inside your DailyProductionDataViewSet class in views.py

    @action(detail=False, methods=['get'], url_path='monthly-summary')
    def monthly_summary(self, request):
        """
        Aggregates bifurcation and other key data for a specific calendar month.
        Used by the main dashboard cards.
        """
        # --- 1. Get query parameters ---
        factory_id = request.query_params.get('factory')
        Hq_id = request.query_params.get('Hq')
        department_id = request.query_params.get('department')
        subline_id = request.query_params.get('subline')
        # shop_floor_id = request.query_params.get('shop_floor')
        line_id = request.query_params.get('line')
        station_id = request.query_params.get('station')
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if not all([factory_id, month, year]):
            return Response(
                {'error': 'Factory, month, and year are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- 2. Build the filter dictionary using FY logic ---
        try:
            fy_start_year = int(year)
            month_val = int(month)
            actual_year = fy_start_year + 1 if month_val < 4 else fy_start_year
            
            import calendar
            from datetime import date
            last_day = calendar.monthrange(actual_year, month_val)[1]
            start_date = date(actual_year, month_val, 1)
            end_date = date(actual_year, month_val, last_day)

            # FY boundary limits based on requirement: Filter data between: start_date >= FY_start_date
            fy_start_date = date(fy_start_year, 4, 1)
            fy_end_date = date(fy_start_year + 1, 3, 31)

            filters = {
                'factory_id': factory_id,
                'start_date__gte': max(start_date, fy_start_date),
                'start_date__lte': min(end_date, fy_end_date),
            }
            if Hq_id: filters['Hq_id'] = Hq_id
            if department_id: filters['department_id'] = department_id
            if subline_id: filters['subline_id'] = subline_id
            if line_id: filters['line_id'] = line_id
            if station_id: filters['station_id'] = station_id
        except (ValueError, TypeError):
            return Response({'error': 'Invalid year or month format.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 3. Define aggregation fields ---
        from django.db.models import Sum

        aggregation_fields = {
            'bifurcation_plan_l1': Sum('bifurcation_plan_l1'),
            'bifurcation_actual_l1': Sum('bifurcation_actual_l1'),
            'bifurcation_plan_l2': Sum('bifurcation_plan_l2'),
            'bifurcation_actual_l2': Sum('bifurcation_actual_l2'),
            'bifurcation_plan_l3': Sum('bifurcation_plan_l3'),
            'bifurcation_actual_l3': Sum('bifurcation_actual_l3'),
            'bifurcation_plan_l4': Sum('bifurcation_plan_l4'),
            'bifurcation_actual_l4': Sum('bifurcation_actual_l4'),
        }

        # --- 4. Query and Aggregate ---
        summary_data = DailyProductionData.objects.filter(**filters).aggregate(**aggregation_fields)
        
        # --- 5. Clean up None values and return ---
        for key, value in summary_data.items():
            if value is None:
                summary_data[key] = 0
        
        return Response(summary_data, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='aggregated-weekly-data')
    def aggregated_weekly_data(self, request):
        """
        Aggregates bifurcation and other key data for a 7-day period (a week).
        Used by the main dashboard cards in weekly view.
        """
        # --- 1. Get query parameters ---
        factory_id = request.query_params.get('factory')
        # shop_floor_id = request.query_params.get('shop_floor')
        Hq_id = request.query_params.get('Hq')
        department_id = request.query_params.get('department')
        subline_id = request.query_params.get('subline')
        line_id = request.query_params.get('line')
        station_id = request.query_params.get('station')
        start_date_str = request.query_params.get('start_date')

        if not all([factory_id, start_date_str]):
            return Response(
                {'error': 'Factory and start_date are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- 2. Calculate date range and build filters with FY bounds ---
        try:
            from datetime import date
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = start_date + timedelta(days=6)
            
            # Determine FY based on start_date
            fy_start_year = start_date.year if start_date.month >= 4 else start_date.year - 1
            fy_start_date = date(fy_start_year, 4, 1)
            fy_end_date = date(fy_start_year + 1, 3, 31)

            filters = {
                'factory_id': factory_id,
                'start_date__gte': max(start_date, fy_start_date),
                'start_date__lte': min(end_date, fy_end_date),
            }
            if Hq_id and Hq_id != 'all':
                filters['hq_id'] = Hq_id
            if department_id and department_id != 'all':
                filters['department_id'] = department_id
            if subline_id and subline_id != 'all':
                filters['subline_id'] = subline_id
            if line_id and line_id != 'all':
                filters['line_id'] = line_id
            if station_id and station_id != 'all':
                filters['station_id'] = station_id
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 3. Define aggregation fields (same as monthly) ---
        from django.db.models import Sum

        aggregation_fields = {
            'bifurcation_plan_l1': Sum('bifurcation_plan_l1'),
            'bifurcation_actual_l1': Sum('bifurcation_actual_l1'),
            'bifurcation_plan_l2': Sum('bifurcation_plan_l2'),
            'bifurcation_actual_l2': Sum('bifurcation_actual_l2'),
            'bifurcation_plan_l3': Sum('bifurcation_plan_l3'),
            'bifurcation_actual_l3': Sum('bifurcation_actual_l3'),
            'bifurcation_plan_l4': Sum('bifurcation_plan_l4'),
            'bifurcation_actual_l4': Sum('bifurcation_actual_l4'),
        }

        # --- 4. Query and Aggregate ---
        summary_data = DailyProductionData.objects.filter(**filters).aggregate(**aggregation_fields)
        
        # --- 5. Clean up None values and return ---
        for key, value in summary_data.items():
            if value is None:
                summary_data[key] = 0
        
        return Response(summary_data, status=status.HTTP_200_OK)
    


    @action(detail=False, methods=['get'], url_path='gap-analysis')
    def gap_analysis(self, request):
        """
        Calculates the gap between plan and actual values for a given period.
        """
        # --- 1. Get and Validate Parameters ---
        factory_id = request.query_params.get('factory')
        hq_id = request.query_params.get('hq')
        department_id = request.query_params.get('department')
        line_id = request.query_params.get('line')
        subline_id = request.query_params.get('subline')
        station_id = request.query_params.get('station')
        month_name = request.query_params.get('month')
        year_str = request.query_params.get('year')

        if not all([factory_id, month_name, year_str]):
            return Response(
                {'error': 'Factory, month, and year are required parameters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- 2. Convert Month Name to Number ---
        try:
            # Create a mapping from month name to month number
            month_map = {name: num for num, name in enumerate(calendar.month_name) if num}
            month_num = month_map.get(month_name.capitalize())
            if not month_num:
                raise ValueError("Invalid month name")
            
            year = int(year_str)
        except (ValueError, TypeError, AttributeError):
            return Response({'error': 'Invalid month or year format.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 3. Build Database Filters ---
        filters = {
            'factory_id': factory_id,
            'start_date__year': year,
            'start_date__month': month_num,
        }
        # Add optional filters only if they are provided
        if hq_id: filters['Hq_id'] = hq_id
        if department_id: filters['department_id'] = department_id
        if line_id: filters['line_id'] = line_id
        if subline_id: filters['subline_id'] = subline_id
        if station_id: filters['station_id'] = station_id
        # You can add shop_floor and line here in the same way if needed
        
        # --- 4. Define All Aggregation Fields ---
        aggregation_fields = {
            'plan_production': Sum('total_production_plan'),
            'actual_production': Sum('total_production_actual'),
            'plan_operators': Sum('total_operators_required_plan'),
            'actual_operators': Sum('total_operators_required_actual'),
            'plan_ctq_l1': Sum('ctq_plan_l1'), 'actual_ctq_l1': Sum('ctq_actual_l1'),
            'plan_ctq_l2': Sum('ctq_plan_l2'), 'actual_ctq_l2': Sum('ctq_actual_l2'),
            'plan_ctq_l3': Sum('ctq_plan_l3'), 'actual_ctq_l3': Sum('ctq_actual_l3'),
            'plan_ctq_l4': Sum('ctq_plan_l4'), 'actual_ctq_l4': Sum('ctq_actual_l4'),
            # Add PDI, Other, etc. in the same pattern if needed by the frontend
        }

        # --- 5. Query the Database ---
        summary_data = DailyProductionData.objects.filter(**filters).aggregate(**aggregation_fields)

        # --- 6. Calculate Gaps and Structure the Response ---
        # Helper function to create the plan/actual/gap structure
        def create_metric(plan_key, actual_key):
            plan = summary_data.get(plan_key) or 0
            actual = summary_data.get(actual_key) or 0
            return {
                "plan": plan,
                "actual": actual,
                "gap": plan - actual
            }

        response_payload = {
            "production": create_metric('plan_production', 'actual_production'),
            "operators": create_metric('plan_operators', 'actual_operators'),
            "ctq_l1": create_metric('plan_ctq_l1', 'actual_ctq_l1'),
            "ctq_l2": create_metric('plan_ctq_l2', 'actual_ctq_l2'),
            "ctq_l3": create_metric('plan_ctq_l3', 'actual_ctq_l3'),
            "ctq_l4": create_metric('plan_ctq_l4', 'actual_ctq_l4'),
        }

        return Response(response_payload, status=status.HTTP_200_OK)
    


   
    @action(detail=False, methods=['get'], url_path='buffer-analysis')
    def buffer_analysis(self, request):
        """
        Performs a two-part analysis for a target period:
        1. Calculates the TOTAL production volume lost due to the overall operator gap.
        2. Calculates the NET AVAILABLE manpower and GAP for each of the 4 levels,
           factoring in attrition and absenteeism.
        """
        # --- 1. Get Simplified Parameters (Unchanged) ---
        factory_id = request.query_params.get('factory')
        Hq_id = request.query_params.get('Hq')
        department_id = request.query_params.get('department')
        line_id = request.query_params.get('line')
        subline_id = request.query_params.get('subline')
        station_id = request.query_params.get('station')
        target_date_str = request.query_params.get('start_date')

        if not all([factory_id, target_date_str]):
            return Response({'error': 'Factory and start_date are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 2. Find the Single Target Record (Unchanged) ---
        filters = {
            'factory_id': factory_id,
            'start_date__lte': target_date,
            'end_date__gte': target_date,
        }
        if Hq_id: filters['hq_id'] = Hq_id
        if department_id: filters['department_id'] = department_id
        if line_id: filters['line_id'] = line_id
        if subline_id: filters['subline_id'] = subline_id
        if station_id: filters['station_id'] = station_id

        matching_records = DailyProductionData.objects.filter(**filters)

        # From the matches, find the one with the shortest duration (most specific)
        # We annotate the query with the duration and order by it, ascending.
        target_record = matching_records.annotate(
            duration=F('end_date') - F('start_date')
        ).order_by('duration').first()

        # If no data exists, return a default structure for consistency
        if not target_record:
            return Response({
                "lost_production_due_to_operator_gap": 0,
                "manpower_analysis_by_level": []
            }, status=status.HTTP_200_OK)

        # --- 3. NEW: Calculate Total Lost Production Volume ---
        lost_production_volume = Decimal('0.0')

        # Prevent division by zero
        if target_record.total_operators_available > 0:
            # Calculate the average production per available operator ("$B$4" from the formula)
            avg_prod_per_operator = (
                Decimal(target_record.total_production_actual) /
                Decimal(target_record.total_operators_available)
            )

            # Check if there was an operator shortfall
            if target_record.total_operators_required_actual < target_record.total_operators_required_plan:
                # Calculate the number of missing operators
                operator_gap = (
                    target_record.total_operators_required_plan -
                    target_record.total_operators_required_actual
                )
                # Calculate the final lost volume
                lost_production_volume = operator_gap * avg_prod_per_operator

        # --- 4. Per-Level Manpower Gap Calculation (Your original logic) ---
        level_analysis_data = []
        attrition_rate = Decimal(target_record.attrition_rate or 0) / Decimal(100)
        absenteeism_rate = Decimal(target_record.absenteeism_rate or 0) / Decimal(100)

        for level in range(1, 5):
            available_field = f'bifurcation_actual_l{level}'
            required_field = f'bifurcation_plan_l{level}'

            operators_available = Decimal(getattr(target_record, available_field, 0))
            operators_required = Decimal(getattr(target_record, required_field, 0))

            net_available = operators_available - (operators_available * absenteeism_rate) - (operators_available * attrition_rate)
            net_available_rounded = int(net_available)
            gap = max(0, int(operators_required - Decimal(net_available_rounded)))

            level_analysis_data.append({
                "name": f"Level {level}",
                "operators_required": int(operators_required),
                "net_available": net_available_rounded,
                "gap": gap,
            })

        # --- 5. Combine results into a single structured response ---
        response_data = {
            "lost_production_due_to_operator_gap": round(lost_production_volume, 2),
            "manpower_analysis_by_level": level_analysis_data
        }

        return Response(response_data, status=status.HTTP_200_OK)
    

    
    # In views.py, replace the gap_volume_analysis function

    @action(detail=False, methods=['get'], url_path='gap-volume-analysis')
    def gap_volume_analysis(self, request):
        factory_id = request.query_params.get('factory')
        Hq_id = request.query_params.get('Hq')
        department_id = request.query_params.get('department')
        line_id = request.query_params.get('line')
        subline_id = request.query_params.get('subline')
        target_date_str = request.query_params.get('start_date') # Only need one date

        if not all([factory_id, target_date_str]):
            return Response({'error': 'Factory and start_date are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format.'}, status=status.HTTP_400_BAD_REQUEST)

        filters = {'factory_id': factory_id, 'start_date__lte': target_date, 'end_date__gte': target_date}
        station_id = request.query_params.get('station')
        if Hq_id: filters['hq_id'] = Hq_id
        if department_id: filters['department_id'] = department_id
        if line_id: filters['line_id'] = line_id
        if subline_id: filters['subline_id'] = subline_id
        if station_id: filters['station_id'] = station_id

        # Find the single record for the target period
        target_record = DailyProductionData.objects.filter(**filters).first()

        if not target_record:
            return Response({'L1': 0, 'L2': 0, 'L3': 0, 'L4': 0}, status=status.HTTP_200_OK)

        gap_data = {}
        attrition_rate = Decimal(target_record.attrition_rate or 0) / Decimal(100)
        absenteeism_rate = Decimal(target_record.absenteeism_rate or 0) / Decimal(100)

        for level in range(1, 5):
            # Use bifurcation fields which are the sums of departments
            operators_available = Decimal(getattr(target_record, f'bifurcation_actual_l{level}', 0))
            operators_required = Decimal(getattr(target_record, f'bifurcation_plan_l{level}', 0))
            net_available = operators_available - (operators_available * absenteeism_rate) - (operators_available * attrition_rate)
            gap_volume = int(operators_required - net_available)
            gap_data[f'L{level}'] = max(0, gap_volume)
        
        return Response(gap_data, status=status.HTTP_200_OK)

    
def get_planning_data(request):
    # --- 1. Get and Validate Parameters ---
    Hq_id = request.GET.get('Hq')
    department_id = request.GET.get('department')
    line_id = request.GET.get('line')
    subline_id = request.GET.get('subline')
    station_id = request.GET.get('station')
    factory_id = request.GET.get('factory')
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')
    group_by = request.GET.get('group_by') # No default, we need it to be explicit

    if not all([factory_id, start_date_str, end_date_str, group_by]):
        return JsonResponse({'success': False, 'error': 'Factory, start_date, end_date, and group_by are required.'}, status=400)

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'success': False, 'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    # --- 2. Build Base Filters ---
    filters = {
        'factory_id': factory_id,
        'start_date__lte': end_date,
        'end_date__gte': start_date,
    }
    # Add optional filters here if needed (station, line, etc.)
    # station_id = request.GET.get('station')
    if station_id:
        filters['station_id'] = station_id
    if Hq_id: filters['hq_id'] = Hq_id
    if department_id: filters['department_id'] = department_id
    if line_id: filters['line_id'] = line_id
    if subline_id: filters['subline_id'] = subline_id
    if station_id: filters['station_id'] = station_id
    
    queryset = DailyProductionData.objects.filter(**filters)
    graph_data = []

    # --- 3. Aggregate data based on the group_by parameter ---
    if group_by == 'month':
        # THIS IS THE NEW, SIMPLER, AND CORRECT LOOP FOR MONTHS
        current_year = start_date.year
        current_month = start_date.month
        while (current_year < end_date.year) or (current_year == end_date.year and current_month <= end_date.month):
            month_name = calendar.month_name[current_month]
            aggregation = queryset.filter(
                start_date__year=current_year,
                start_date__month=current_month
            ).aggregate(
                total_plan_prod=Sum('total_production_plan'),
                total_actual_manpower=Sum('total_operators_required_actual'),
                total_operators_plan=Sum('total_operators_required_plan'),
                total_operators_actual=Sum('total_operators_required_actual')
            )
            graph_data.append({
                "label": month_name,
                "planned_production": aggregation['total_plan_prod'] or 0,
                "actual_manpower": aggregation['total_actual_manpower'] or 0,
                "total_operators_required_plan": aggregation['total_operators_plan'] or 0,
                "total_operators_required_actual": aggregation['total_operators_actual'] or 0,
            })
            # Advance to the next month
            current_month += 1
            if current_month > 12:
                current_month = 1
                current_year += 1

    elif group_by == 'week':
        current_week_start = start_date
        while current_week_start <= end_date:
            current_week_end = current_week_start + timedelta(days=6)
            week_label = f"Week of {current_week_start.strftime('%b %d')}"
            aggregation = queryset.filter(
                start_date__lte=current_week_end,
                end_date__gte=current_week_start
            ).aggregate(
                total_plan_prod=Sum('total_production_plan'),
                total_actual_manpower=Sum('total_operators_required_actual'),
                total_operators_plan=Sum('total_operators_required_plan'),
                total_operators_actual=Sum('total_operators_required_actual')
            )
            graph_data.append({
                "label": week_label,
                "planned_production": aggregation['total_plan_prod'] or 0,
                "actual_manpower": aggregation['total_actual_manpower'] or 0,
                "total_operators_required_plan": aggregation['total_operators_plan'] or 0,
                "total_operators_required_actual": aggregation['total_operators_actual'] or 0,
            })
            current_week_start += timedelta(days=7)

    response_payload = { "success": True, "data": graph_data }
    return JsonResponse(response_payload, status=200)






from django.http import JsonResponse
from django.db.models import Sum
from django.utils import timezone
import calendar
from datetime import datetime
from dateutil import parser

def get_operators_required_trend(request):
    factory_id = request.GET.get('factory')
    time_view = request.GET.get('time_view', 'Monthly')
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if not factory_id or not start_date_str or not end_date_str:
        return JsonResponse({'error': 'Factory, start_date, and end_date are required.'}, status=400)

    try:
        start_date = parser.parse(start_date_str).date()
        end_date = parser.parse(end_date_str).date()
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Invalid date format.'}, status=400)

    if start_date > end_date:
        return JsonResponse({'error': 'start_date cannot be later than end_date.'}, status=400)

    filters = {'factory_id': factory_id}
    # --- EDIT THIS SECTION ---
    if request.GET.get('Hq'):
        filters['Hq_id'] = request.GET.get('Hq')
    if request.GET.get('department'):
        filters['department_id'] = request.GET.get('department')
    if request.GET.get('line'):
        filters['line_id'] = request.GET.get('line')
    if request.GET.get('subline'):
        filters['subline_id'] = request.GET.get('subline')
    if request.GET.get('station'):
        filters['station_id'] = request.GET.get('station')
    # if request.GET.get('shop_floor'): # Keep if still in use
    #     filters['shop_floor_id'] = request.GET.get('shop_floor')

    trend_data = []
    data_type = time_view

    if time_view == 'Weekly':
        # Existing weekly logic (working fine)
        from dateutil.rrule import rrule, WEEKLY
        weeks = list(rrule(WEEKLY, dtstart=start_date, until=end_date))
        for week_start in weeks:
            week_end = min(week_start.date() + timedelta(days=6), end_date)
            weekly_filters = filters.copy()
            weekly_filters['start_date__range'] = (week_start.date(), week_end)
            weekly_aggregation = DailyProductionData.objects.filter(**weekly_filters).aggregate(
                plan_sum=Sum('total_operators_required_plan'),
                actual_sum=Sum('total_operators_required_actual')
            )
            trend_data.append({
                'period': week_start.date().isoformat(),
                'total_operators_required_plan': weekly_aggregation['plan_sum'] or 0,
                'total_operators_required_actual': weekly_aggregation['actual_sum'] or 0,
            })
    else:  # Monthly
        current_date = start_date.replace(day=1)
        while current_date <= end_date:
            year = current_date.year
            month = current_date.month

            # Create filters for this specific month and year
            monthly_filters = filters.copy()
            monthly_filters['start_date__year'] = year
            monthly_filters['start_date__month'] = month

            # Aggregate data for just this month
            monthly_aggregation = DailyProductionData.objects.filter(**monthly_filters).aggregate(
                plan_sum=Sum('total_operators_required_plan'),
                actual_sum=Sum('total_operators_required_actual')
            )
            
            # Append this month's data to the list
            trend_data.append({
                'period': calendar.month_name[month],
                'year': year,
                'total_operators_required_plan': monthly_aggregation['plan_sum'] or 0,
                'total_operators_required_actual': monthly_aggregation['actual_sum'] or 0,
            })

            if month == 12:
                current_date = current_date.replace(year=year + 1, month=1)
            else:
                current_date = current_date.replace(month=month + 1)

    return JsonResponse({
        'data_type': data_type,
        'data': trend_data
    }, safe=False, status=200)





from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Sum, Avg
from .models import DailyProductionData
from datetime import datetime
from dateutil import parser
import calendar
from math import floor, ceil

@require_GET
def monthly_availability_analysis(request):
    """
    Monthly gap analysis endpoint for /production-data/gap-analysis/.
    Computes GAP, gap_message, and Lost Production for multiple production plan scenarios.
    """
    # Get query parameters
    factory_id = request.GET.get('factory')
    month = request.GET.get('month')  # e.g., "March"
    year = request.GET.get('year')  # e.g., "2025"
    # shop_floor_id = request.GET.get('shop_floor')
    line_id = request.GET.get('line')
    station_id = request.GET.get('station')
    Hq_id = request.GET.get('Hq')
    department_id = request.GET.get('department')
    subline_id = request.GET.get('subline')

    # Validate required parameters
    if not (factory_id and month and year):
        return JsonResponse(
            {"success": False, "error": "Missing required parameters: factory, month, year"},
            status=400
        )

    try:
        year = int(year)
        month_num = list(calendar.month_name).index(month.capitalize())
    except (ValueError, IndexError):
        return JsonResponse(
            {"success": False, "error": "Invalid month or year format"},
            status=400
        )

    # Determine date range for the month
    start_date = datetime(year, month_num, 1)
    _, last_day = calendar.monthrange(year, month_num)
    end_date = datetime(year, month_num, last_day)

    # Calculate dynamic productivity rate from previous month's data
    prev_month = start_date.replace(day=1, month=month_num - 1 if month_num > 1 else 12)
    prev_year = year if month_num > 1 else year - 1
    prev_data = DailyProductionData.objects.filter(
        factory_id=factory_id,
        start_date__year=prev_year,
        start_date__month=prev_month.month,
        entry_mode='MONTHLY'
    ).aggregate(
        total_production_actual=Sum('total_production_actual'),
        total_operators_actual=Sum('total_operators_required_actual')
    )
    productivity_rate = (
        prev_data['total_production_actual'] / prev_data['total_operators_actual']
        if prev_data['total_production_actual'] and prev_data['total_operators_actual']
        else 12  # Fallback to Excel's default
    )

    # Build queryset with filters
    queryset = DailyProductionData.objects.filter(
        factory_id=factory_id,
        start_date__gte=start_date,
        end_date__lte=end_date,
        entry_mode='MONTHLY'
    )
    if Hq_id:
        queryset = queryset.filter(Hq_id=Hq_id)
    if department_id:
        queryset = queryset.filter(department_id=department_id)
    if subline_id:
        queryset = queryset.filter(subline_id=subline_id)
    # if shop_floor_id:
    #     queryset = queryset.filter(shop_floor_id=shop_floor_id)
    if line_id:
        queryset = queryset.filter(line_id=line_id)
    if station_id:
        queryset = queryset.filter(station_id=station_id)

    # Process multiple scenarios
    data_points = []
    for record in queryset:
        # Calculate Excel-derived values
        ending_team = record.total_operators_available * (1 - record.attrition_rate / 100)
        operators_available = floor(ending_team * (1 - record.absenteeism_rate / 100))  # ROUNDDOWN
        gap = operators_available - record.total_operators_required_plan
        lost_production = abs(gap) * productivity_rate if gap < 0 else 0
        gap_message = (
            f"Shortage: Hire {abs(gap)}" if gap < 0 else
            f"Surplus of {gap}" if gap > 0 else
            "Balanced"
        )

        # Previous month's actual operators for context
        prev_data = DailyProductionData.objects.filter(
            factory_id=factory_id,
            start_date__year=prev_year,
            start_date__month=prev_month.month,
            entry_mode='MONTHLY'
        ).aggregate(total_actual=Sum('total_operators_required_actual'))

        data_points.append({
            "month": month,
            "year": year,
            "production_plan": {"value": record.total_production_plan},
            "operators_required": {"value": record.total_operators_required_plan},
            "operators_available": {"value": operators_available},
            "gap": {"value": gap},
            "gap_message": gap_message,
            "lost_production": {"value": round(lost_production)},
            "attrition_rate": float(record.attrition_rate),
            "previous_month_data": {
                "month": calendar.month_name[prev_month.month],
                "actual_operators": prev_data['total_actual'] or 0
            } if prev_data['total_actual'] else None
        })

    if not data_points:
        return JsonResponse(
            {"success": False, "error": "No data found for the selected filters"},
            status=404
        )

    return JsonResponse({
        "success": True,
        "operators_availability_graph": data_points[0] if len(data_points) == 1 else data_points
    })

@require_GET
def weekly_availability_summary(request):
    """
    Weekly summary endpoint for /production-data/date-range-summary/.
    Aggregates data for a week and computes GAP, gap_message, and Lost Production.
    """
    # Get query parameters
    factory_id = request.GET.get('factory')
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')
    # shop_floor_id = request.GET.get('shop_floor')
    line_id = request.GET.get('line')
    station_id = request.GET.get('station')
    Hq_id = request.GET.get('Hq')
    department_id = request.GET.get('department')
    subline_id = request.GET.get('subline')

    # Validate required parameters
    if not (factory_id and start_date_str and end_date_str):
        return JsonResponse(
            {"success": False, "error": "Missing required parameters: factory, start_date, end_date"},
            status=400
        )

    try:
        start_date = parser.parse(start_date_str).date()
        end_date = parser.parse(end_date_str).date()
    except ValueError:
        return JsonResponse(
            {"success": False, "error": "Invalid date format"},
            status=400
        )

    # Calculate dynamic productivity rate from previous week's data
    prev_week_end = start_date - timedelta(days=1)
    prev_week_start = prev_week_end - timedelta(days=6)
    prev_data = DailyProductionData.objects.filter(
        factory_id=factory_id,
        start_date__gte=prev_week_start,
        end_date__lte=prev_week_end,
        entry_mode='WEEKLY'
    ).aggregate(
        total_production_actual=Sum('total_production_actual'),
        total_operators_actual=Sum('total_operators_required_actual')
    )
    productivity_rate = (
        prev_data['total_production_actual'] / prev_data['total_operators_actual']
        if prev_data['total_production_actual'] and prev_data['total_operators_actual']
        else 12  # Fallback to Excel's default
    )

    # Build queryset with filters
    queryset = DailyProductionData.objects.filter(
        factory_id=factory_id,
        start_date__gte=start_date,
        end_date__lte=end_date,
        entry_mode='WEEKLY'
    )
    if Hq_id:
        queryset = queryset.filter(Hq_id=Hq_id)
    if department_id:
        queryset = queryset.filter(department_id=department_id)
    if subline_id:
        queryset = queryset.filter(subline_id=subline_id)
    # if shop_floor_id:
    #     queryset = queryset.filter(shop_floor_id=shop_floor_id)
    if line_id:
        queryset = queryset.filter(line_id=line_id)
    if station_id:
        queryset = queryset.filter(station_id=station_id)

    # Aggregate data for the week
    aggregates = queryset.aggregate(
        total_production_plan=Sum('total_production_plan'),
        total_operators_required_plan=Sum('total_operators_required_plan'),
        total_operators_available=Sum('total_operators_available'),
        avg_attrition_rate=Avg('attrition_rate'),
        avg_absenteeism_rate=Avg('absenteeism_rate')
    )

    if not aggregates['total_production_plan']:
        return JsonResponse(
            {"success": False, "error": "No data found for the selected week"},
            status=404
        )

    # Calculate Excel-derived values
    ending_team = aggregates['total_operators_available'] * (1 - aggregates['avg_attrition_rate'] / 100)
    operators_available = floor(ending_team * (1 - aggregates['avg_absenteeism_rate'] / 100))  # ROUNDDOWN
    gap = operators_available - aggregates['total_operators_required_plan']
    lost_production = abs(gap) * productivity_rate if gap < 0 else 0
    gap_message = (
        f"Shortage: Hire {abs(gap)}" if gap < 0 else
        f"Surplus of {gap}" if gap > 0 else
        "Balanced"
    )

    return JsonResponse({
        "success": True,
        "total_production_plan": aggregates['total_production_plan'] or 0,
        "total_operators_required_plan": aggregates['total_operators_required_plan'] or 0,
        "total_operators_required_actual": operators_available,
        "attrition_rate": float(aggregates['avg_attrition_rate'] or 0),
        "gap": gap,
        "gap_message": gap_message,
        "lost_production": round(lost_production)
    })



from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SkillMatrix
from .serializers import SkillMatrixSerializer


from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SkillMatrix
from .serializers import SkillMatrixSerializer

class SkillMatrixViewSet(viewsets.ModelViewSet):
    # Optimize queryset to fetch related foreign keys in one query
    queryset = SkillMatrix.objects.select_related('level', 'hierarchy__station', 'hierarchy__department').all()
    serializer_class = SkillMatrixSerializer

    # Custom endpoint: filter by station_id
    @action(detail=False, methods=["get"])
    def by_station(self, request):
        station_id = request.query_params.get("station_id")
        if not station_id:
            return Response({"error": "station_id parameter is required"}, status=400)

        queryset = self.queryset.filter(hierarchy__station_id=station_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import HierarchyStructure

class HierarchyAllDepartmentsView(APIView):
    """
    Fetch hierarchy for all departments with flexible nesting:
    department → line → subline → station
    department → line → station
    department → subline → station
    department → station
    """

    def get(self, request, *args, **kwargs):
        try:
            structures = HierarchyStructure.objects.select_related(
                "department", "line", "subline", "station"
            )

            if not structures.exists():
                return Response(
                    {"error": "No hierarchy data found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            departments_data = {}

            for structure in structures:
                department = structure.department
                if not department:
                    continue  # skip if no department linked

                dept_id = department.department_id
                if dept_id not in departments_data:
                    departments_data[dept_id] = {
                        "department_id": dept_id,
                        "department_name": department.department_name,
                        "lines": {},
                        "sublines": {},
                        "stations": {},
                    }

                department_data = departments_data[dept_id]
                line = structure.line
                subline = structure.subline
                station = structure.station

                if line:
                    if line.line_id not in department_data["lines"]:
                        department_data["lines"][line.line_id] = {
                            "line_id": line.line_id,
                            "line_name": line.line_name,
                            "sublines": {},
                            "stations": {},
                        }

                    if subline:
                        if subline.subline_id not in department_data["lines"][line.line_id]["sublines"]:
                            department_data["lines"][line.line_id]["sublines"][subline.subline_id] = {
                                "subline_id": subline.subline_id,
                                "subline_name": subline.subline_name,
                                "stations": {},
                            }

                        if station:
                            department_data["lines"][line.line_id]["sublines"][subline.subline_id]["stations"][
                                station.station_id
                            ] = {
                                "station_id": station.station_id,
                                "station_name": station.station_name,
                            }
                    else:
                        if station:
                            department_data["lines"][line.line_id]["stations"][station.station_id] = {
                                "station_id": station.station_id,
                                "station_name": station.station_name,
                            }

                elif subline:
                    if subline.subline_id not in department_data["sublines"]:
                        department_data["sublines"][subline.subline_id] = {
                            "subline_id": subline.subline_id,
                            "subline_name": subline.subline_name,
                            "stations": {},
                        }

                    if station:
                        department_data["sublines"][subline.subline_id]["stations"][station.station_id] = {
                            "station_id": station.station_id,
                            "station_name": station.station_name,
                        }

                elif station:
                    department_data["stations"][station.station_id] = {
                        "station_id": station.station_id,
                        "station_name": station.station_name,
                    }

            # convert dicts to lists for clean JSON
            for dept_id, department_data in departments_data.items():
                department_data["lines"] = list(department_data["lines"].values())
                for line in department_data["lines"]:
                    line["sublines"] = list(line["sublines"].values())
                    line["stations"] = list(line["stations"].values())
                    for subline in line["sublines"]:
                        subline["stations"] = list(subline["stations"].values())

                department_data["sublines"] = list(department_data["sublines"].values())
                for subline in department_data["sublines"]:
                    subline["stations"] = list(subline["stations"].values())

                department_data["stations"] = list(department_data["stations"].values())

            return Response(list(departments_data.values()), status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
from django.conf import settings
import os
import mimetypes
from .models import UserManualdocs
from .serializers import UserManualdocsSerializer

class UserManualdocsListCreateView(generics.ListCreateAPIView):
    queryset = UserManualdocs.objects.all()
    serializer_class = UserManualdocsSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'message': 'Document uploaded successfully!',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                'message': 'Failed to upload document',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

class UserManualdocsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserManualdocs.objects.all()
    serializer_class = UserManualdocsSerializer
    parser_classes = [MultiPartParser, FormParser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Document deleted successfully!'},
            status=status.HTTP_200_OK
        )

@api_view(['GET'])
def view_file(request, doc_id):
    try:
        doc = get_object_or_404(UserManualdocs, id=doc_id)
        
        if not doc.file:
            return Response(
                {'error': 'No file associated with this document'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        file_path = doc.file.path
        
        if not os.path.exists(file_path):
            return Response(
                {'error': 'File not found on server'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the file's MIME type
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type is None:
            mime_type = 'application/octet-stream'
        
        # Read the file
        try:
            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=mime_type)
                
                # Set headers for inline viewing (opens in browser)
                filename = os.path.basename(file_path)
                response['Content-Disposition'] = f'inline; filename="{filename}"'
                
                return response
                
        except Exception as e:
            return Response(
                {'error': f'Error reading file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except UserManualdocs.DoesNotExist:
        return Response(
            {'error': 'Document not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def download_file(request, doc_id):
    try:
        doc = get_object_or_404(UserManualdocs, id=doc_id)
        
        if not doc.file:
            return Response(
                {'error': 'No file associated with this document'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        file_path = doc.file.path
        
        if not os.path.exists(file_path):
            return Response(
                {'error': 'File not found on server'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the file's MIME type
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type is None:
            mime_type = 'application/octet-stream'
        
        # Read the file
        try:
            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=mime_type)
                
                # Set headers for forced download
                filename = os.path.basename(file_path)
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
                
                return response
                
        except Exception as e:
            return Response(
                {'error': f'Error reading file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except UserManualdocs.DoesNotExist:
        return Response(
            {'error': 'Document not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    

# =================== TrainingAttendance ============================= #



from django.utils import timezone
from django.db import transaction
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

# Make sure all your models and serializers are imported
from .models import TrainingBatch, UserRegistration, TrainingAttendance, Days
from .serializers import TrainingBatchSerializer, BatchAttendanceDetailSerializer, TrainingAttendanceSerializer

# --- Active/Past Batch Views (Unchanged, but included for context) ---
class ActiveTrainingBatchListView(generics.ListAPIView):
    queryset = TrainingBatch.objects.filter(is_active=True)
    serializer_class = TrainingBatchSerializer



class BatchAttendanceDetailView(APIView):
    """
    GET /api/attendance-detail/{batch_id}/
    Returns all data needed for the attendance page.
    The concept of 'next_training_day_to_mark' is removed from the logic,
    as all days are now editable. It is kept in the response for compatibility but is null.
    """
    def get(self, request, batch_id, *args, **kwargs):
        try:
            batch = TrainingBatch.objects.get(batch_id=batch_id)
        except TrainingBatch.DoesNotExist:
            return Response({"error": "Batch not found."}, status=status.HTTP_404_NOT_FOUND)

        users = UserRegistration.objects.filter(batch_id=batch_id)
        if not users.exists():
            return Response({"error": "No users found for this batch."}, status=status.HTTP_404_NOT_FOUND)

        data = {
            'batch_id': batch_id,
            'next_training_day_to_mark': None, # This is no longer used to lock UI
            'is_completed': not batch.is_active,
            'users': users
        }
        
        serializer = BatchAttendanceDetailSerializer(data, context={'batch_id': batch_id})
        return Response(serializer.data, status=status.HTTP_200_OK)




class PastTrainingBatchListView(generics.ListAPIView):
    queryset = TrainingBatch.objects.filter(is_active=False)
    serializer_class = TrainingBatchSerializer

class BulkAttendanceUpdateView(APIView):
    """
    POST /api/attendances/
    Creates or updates a list of attendance records. This view is designed to be
    flexible, accepting records for multiple users across multiple days in a single request.
    It uses a transaction to ensure all updates succeed or none do.
    """
    def post(self, request, *args, **kwargs):
        attendance_data = request.data
        if not isinstance(attendance_data, list):
            return Response({"error": "Expected a list of attendance objects."}, status=status.HTTP_400_BAD_REQUEST)
        if not attendance_data:
            return Response({"message": "No attendance data provided to update."}, status=status.HTTP_200_OK)

        target_batch_id = attendance_data[0].get('batch')
        if not target_batch_id:
             return Response({"error": "Batch ID is missing in payload."}, status=status.HTTP_400_BAD_REQUEST)

        created_records = []
        updated_records = []

        try:
            # Use a transaction to make the entire operation atomic
            with transaction.atomic():
                for item in attendance_data:
                    user_id = item.get('user')
                    day_id = item.get('day_number')
                    status_val = item.get('status')

                    if not all([user_id, day_id, status_val]):
                        raise ValueError(f"Invalid item in payload: {item}")

                    # Use update_or_create to handle both new and existing records
                    obj, created = TrainingAttendance.objects.update_or_create(
                        user_id=user_id,
                        batch_id=target_batch_id,
                        day_number_id=day_id,
                        defaults={
                            'status': status_val,
                            'attendance_date': timezone.now().date()
                        }
                    )
                    
                    if created:
                        created_records.append(TrainingAttendanceSerializer(obj).data)
                    else:
                        updated_records.append(TrainingAttendanceSerializer(obj).data)

            # --- Auto-Completion Logic ---
            # After saving, check if the batch should be completed.
            # We'll use Day 6 as the trigger.
            final_day_id = 6 # Assuming Day ID 6 is the final day. Adjust if necessary.
            if any(item.get('day_number') == final_day_id for item in attendance_data):
                all_users_in_batch_count = UserRegistration.objects.filter(batch_id=target_batch_id).count()
                final_day_attendance_count = TrainingAttendance.objects.filter(
                    batch_id=target_batch_id,
                    day_number_id=final_day_id
                ).count()

                if all_users_in_batch_count > 0 and all_users_in_batch_count == final_day_attendance_count:
                    # All users have the final day marked, so complete the batch.
                    TrainingBatch.objects.filter(batch_id=target_batch_id).update(is_active=False)
                    print(f"✅ Automatically completed batch {target_batch_id}")


        except (ValueError, Days.DoesNotExist, UserRegistration.DoesNotExist) as e:
            return Response({"error": f"Data validation error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "message": f"Attendance saved successfully. {len(created_records)} created, {len(updated_records)} updated.",
            "created": created_records,
            "updated": updated_records
        }, status=status.HTTP_201_CREATED)

class CompleteTrainingBatchView(APIView):
    def post(self, request, batch_id, *args, **kwargs):
        try:
            batch = TrainingBatch.objects.get(batch_id=batch_id)
            if not batch.is_active:
                return Response({"message": "Batch is already completed."}, status=status.HTTP_200_OK)
            batch.is_active = False
            batch.save()
            return Response(TrainingBatchSerializer(batch).data, status=status.HTTP_200_OK)
        except TrainingBatch.DoesNotExist:
            return Response({"error": "Batch not found."}, status=status.HTTP_404_NOT_FOUND)
        


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Exists, OuterRef


class AbsentUsersListView(APIView):
    """
    GET /api/batch/{batch_id}/absentees/
    Returns only absences that are NOT yet rescheduled.
    After rescheduling, they disappear from this list permanently.
    """
    def get(self, request, batch_id, *args, **kwargs):
        batch = get_object_or_404(TrainingBatch, batch_id=batch_id)
        
        day_id = request.query_params.get('day')
        overall = request.query_params.get('overall', '').lower() == 'true'

        users_in_batch = UserRegistration.objects.filter(batch_id=batch_id)
        if not users_in_batch.exists():
            return Response({"detail": "No users in this batch."}, status=status.HTTP_404_NOT_FOUND)

        # Subquery: Does a rescheduled session exist for this exact absence?
        rescheduled_subquery = RescheduledSession.objects.filter(
            employee=OuterRef('user'),
            batch=OuterRef('batch'),
            original_day=OuterRef('day_number'),
        )

        # Base query: all absences that are NOT rescheduled
        absent_attendances = TrainingAttendance.objects.filter(
            batch_id=batch_id,
            status='absent'
        ).exclude(
            Exists(rescheduled_subquery)
        ).select_related('user', 'day_number')

        if day_id:
            # Specific day
            day_id = int(day_id)
            absent_attendances = absent_attendances.filter(day_number__days_id=day_id)
            absent_users = absent_attendances.values(
                'user__id', 'user__temp_id', 'user__first_name', 'user__last_name', 'attendance_date'
            )
            absent_list = [
                {
                    "id": u["user__id"],
                    "temp_id": u["user__temp_id"],
                    "full_name": f"{u['user__first_name']} {u['user__last_name'] or ''}".strip(),
                    "attendance_date": u["attendance_date"],
                }
                for u in absent_users
            ]
            return Response({
                "batch_id": batch_id,
                "on_day": day_id,
                "total_absent": len(absent_list),
                "absent_users": absent_list
            }, status=status.HTTP_200_OK)

        elif overall:
            # Overall unique users with at least one pending absence
            absent_user_ids = absent_attendances.values_list('user_id', flat=True).distinct()
            absent_users = users_in_batch.filter(id__in=absent_user_ids).values(
                'id', 'temp_id', 'first_name', 'last_name'
            )
            absent_list = [
                {
                    "id": u["id"],
                    "temp_id": u["temp_id"],
                    "full_name": f"{u['first_name']} {u['last_name'] or ''}".strip(),
                }
                for u in absent_users
            ]
            return Response({
                "batch_id": batch_id,
                "scope": "overall",
                "total_absent": len(absent_list),
                "absent_users": absent_list
            }, status=status.HTTP_200_OK)

        else:
            # DEFAULT: Grouped by day (this is what your frontend uses)
            absences = absent_attendances.values(
                'day_number_id', 'day_number__days_id'
            ).annotate(
                count=Count('id')
            ).order_by('day_number__days_id')

            result = []
            for item in absences:
                day_absent_users = absent_attendances.filter(
                    day_number_id=item['day_number_id']
                )

                result.append({
                    "day_number": item['day_number__days_id'],
                    "absent_count": item['count'],
                    "absent_users": [
                        {
                            "id": att.user.id,
                            "temp_id": att.user.temp_id,
                            "full_name": f"{att.user.first_name} {att.user.last_name or ''}".strip(),
                            "attendance_date": att.attendance_date.isoformat() if att.attendance_date else None,
                        }
                        for att in day_absent_users
                    ]
                })

            return Response({
                "absentees_by_day": result
            }, status=status.HTTP_200_OK)




from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from .models import RescheduledSession, SubTopic, Days, TrainingBatch, UserRegistration
from .serializers import (
    RescheduledSessionSerializer,
    RescheduledSessionCreateSerializer,
    MarkRescheduledAttendanceSerializer,
    SubTopicSimpleSerializer
)


class SubTopicsByDayView(generics.ListAPIView):
    """
    GET /api/subtopics/by-day/{day_id}/
    Returns all subtopics for a specific training day.
    """
    serializer_class = SubTopicSimpleSerializer
    
    def get_queryset(self):
        day_id = self.kwargs.get('day_id')
        return SubTopic.objects.filter(days__days_id=day_id).select_related('days')


class RescheduledSessionListView(generics.ListAPIView):
    """
    GET /api/rescheduled-sessions/
    Optional query params:
        ?batch_id=xxx     → Filter by batch
        ?status=scheduled → Filter by status (scheduled/completed/cancelled)
        ?employee_id=123  → Filter by employee
    """
    serializer_class = RescheduledSessionSerializer
    
    def get_queryset(self):
        queryset = RescheduledSession.objects.all().select_related(
            'employee',
            'batch',
            'original_day',
            'training_subtopic'
        )
        
        # Apply filters
        batch_id = self.request.query_params.get('batch_id')
        status_filter = self.request.query_params.get('status')
        employee_id = self.request.query_params.get('employee_id')
        
        if batch_id:
            queryset = queryset.filter(batch__batch_id=batch_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        return queryset


class RescheduledSessionCreateView(generics.CreateAPIView):
    """
    POST /api/rescheduled-sessions/create/
    Body: {
        "employee": 1,
        "batch": "BATCH-21-11-2025-1",
        "original_day": 3,
        "original_date": "2025-11-15",
        "rescheduled_date": "2025-11-25",
        "rescheduled_time": "10:30",
        "training_subtopic": 5,
        "training_name": "React Advanced Patterns",
        "notes": "Make-up session for Day 3"
    }
    """
    serializer_class = RescheduledSessionCreateSerializer
    
    def perform_create(self, serializer):
        serializer.save()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full session data
        session = RescheduledSession.objects.get(id=serializer.instance.id)
        response_serializer = RescheduledSessionSerializer(session)
        
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class RescheduledSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/rescheduled-sessions/{id}/
    Retrieve, update, or delete a specific rescheduled session.
    """
    queryset = RescheduledSession.objects.all()
    serializer_class = RescheduledSessionSerializer
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Prevent updating if attendance already marked
        if instance.attendance_marked and not partial:
            return Response(
                {"error": "Cannot fully update a session with marked attendance."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)


class MarkRescheduledAttendanceView(APIView):
    def post(self, request):
        serializer = MarkRescheduledAttendanceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        session_id = serializer.validated_data['session_id']
        attendance_status = serializer.validated_data['attendance_status']
        marked_by = serializer.validated_data.get('marked_by', 'Admin')
        photo = serializer.validated_data.get('photo')

        try:
            session = RescheduledSession.objects.get(id=session_id)
        except RescheduledSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)

        if photo:
            session.attendance_photo = photo

        session.attendance_marked = True
        session.attendance_status = attendance_status
        session.status = 'completed'
        session.attendance_marked_at = timezone.now()
        session.marked_by = marked_by
        session.save()

        # THE ONLY CHANGE YOU NEED
        photo_url = None
        if session.attendance_photo:
            photo_url = request.build_absolute_uri(session.attendance_photo.url)

        return Response({
            'message': 'Attendance marked successfully',
            'session': {
                'id': session.id,
                'attendance_photo_url': photo_url,
                'attendance_marked': True,
                'attendance_status': 'present',
                'status': 'completed'
            }
        })

class BatchRescheduledSessionsView(APIView):
    """
    GET /api/batch/{batch_id}/rescheduled-sessions/
    Returns all rescheduled sessions for a specific batch with statistics.
    """
    
    def get(self, request, batch_id, *args, **kwargs):
        batch = get_object_or_404(TrainingBatch, batch_id=batch_id)
        
        sessions = RescheduledSession.objects.filter(
            batch=batch
        ).select_related(
            'employee',
            'original_day',
            'training_subtopic'
        ).order_by('-rescheduled_date', '-rescheduled_time')
        
        serializer = RescheduledSessionSerializer(sessions, many=True)
        
        # Calculate statistics
        total_sessions = sessions.count()
        scheduled = sessions.filter(status='scheduled').count()
        completed = sessions.filter(status='completed').count()
        cancelled = sessions.filter(status='cancelled').count()
        
        return Response({
            "batch_id": batch_id,
            "statistics": {
                "total": total_sessions,
                "scheduled": scheduled,
                "completed": completed,
                "cancelled": cancelled
            },
            "sessions": serializer.data
        }, status=status.HTTP_200_OK)



class RescheduleFromAbsentView(APIView):
    """
    POST /api/reschedule-from-absent/
    Convenience endpoint to create a rescheduled session directly from absent record.
    
    Body: {
        "employee_id": 1,
        "batch_id": "BATCH-21-11-2025-1",
        "absent_day": 3,
        "rescheduled_date": "2025-11-25",
        "rescheduled_time": "10:30",
        "training_subtopic_id": 5,
        "training_name": "React Advanced Patterns",
        "notes": "Optional notes"
    }
    """
    
    def post(self, request, *args, **kwargs):
        data = request.data
        
        # Validate required fields
        required_fields = [
            'employee_id', 'batch_id', 'absent_day',
            'rescheduled_date', 'rescheduled_time', 'training_name'
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return Response(
                {"error": f"Missing required fields: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            employee = UserRegistration.objects.get(id=data['employee_id'])
            batch = TrainingBatch.objects.get(batch_id=data['batch_id'])
            original_day = Days.objects.get(days_id=data['absent_day'])
            
            # Get training subtopic if provided
            training_subtopic = None
            if data.get('training_subtopic_id'):
                training_subtopic = SubTopic.objects.get(
                    subtopic_id=data['training_subtopic_id']
                )
            
            # Find the original absence date
            from .models import TrainingAttendance
            absent_record = TrainingAttendance.objects.filter(
                user=employee,
                batch=batch,
                day_number=original_day,
                status='absent'
            ).first()
            
            original_date = absent_record.attendance_date if absent_record else timezone.now().date()
            
            # Create rescheduled session
            session = RescheduledSession.objects.create(
                employee=employee,
                batch=batch,
                original_day=original_day,
                original_date=original_date,
                rescheduled_date=data['rescheduled_date'],
                rescheduled_time=data['rescheduled_time'],
                training_subtopic=training_subtopic,
                training_name=data['training_name'],
                notes=data.get('notes', ''),
                status='scheduled'
            )
            
            serializer = RescheduledSessionSerializer(session)
            
            return Response({
                "message": "Session rescheduled successfully",
                "session": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except UserRegistration.DoesNotExist:
            return Response(
                {"error": "Employee not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except TrainingBatch.DoesNotExist:
            return Response(
                {"error": "Batch not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Days.DoesNotExist:
            return Response(
                {"error": "Invalid day"},
                status=status.HTTP_404_NOT_FOUND
            )
        except SubTopic.DoesNotExist:
            return Response(
                {"error": "Training subtopic not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
# =================== TrainingAttendance End ============================= #
           


# views.py (COMPLETE WITH FINANCIAL YEAR SUPPORT)

from django.utils import timezone
from django.db.models import Sum, Avg, Q
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.http import HttpResponse
from django.db import transaction
import pandas as pd
import io

from .models import ManagementReview, Hq, Factory, Department, Line, SubLine, Station
from .serializers import ManagementReviewSerializer

# =================== VIEWSET ===================
class ManagementReviewViewSet(viewsets.ModelViewSet):
    queryset = ManagementReview.objects.all().select_related('hq', 'factory', 'department','line','subline','station')
    serializer_class = ManagementReviewSerializer
    pagination_class = None

# =================== EXCEL DOWNLOAD TEMPLATE ===================
class ManagementDownloadTemplateView(APIView):
    def get(self, request):
        columns = [
            'HQ Name', 'Factory Name', 'Department Name', 'Line Name',
            'Subline Name', 'Station Name', 'Month (1-12)', 'Year (YYYY)',
            'New Operators Joined', 'New Operators Trained',
            'Total Training Plans', 'Total Trainings Actual',
            'Total Defects MSIL', 'CTQ Defects MSIL',
            'Total Defects Tier1', 'CTQ Defects Tier1',
            'Total Internal Rejection', 'CTQ Internal Rejection',
            'Manpower Available', 'Manpower Required', 'GCA Defects'
        ]
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_template = pd.DataFrame(columns=columns)
            df_template.to_excel(writer, sheet_name='Fill_Data_Here', index=False)
            
            instructions = [
                ["Column", "Instruction"],
                ["Hierarchy", "Copy names exactly from 'Reference_Data' sheet."],
                ["Month/Year", "Numeric only (e.g., Month: 10, Year: 2025)."],
                ["Metrics", "Numeric integers only. Use 0 for empty values."],
                ["GCA Defects", "Decimal numbers allowed (e.g., 12.5)."],
            ]
            pd.DataFrame(instructions[1:], columns=instructions[0]).to_excel(writer, sheet_name='Instructions', index=False)
            
            hqs = list(Hq.objects.values_list('hq_name', flat=True))
            factories = list(Factory.objects.values_list('factory_name', flat=True))
            departments = list(Department.objects.values_list('department_name', flat=True))
           
            max_len = max(len(hqs), len(factories), len(departments))
            ref_data = {
                'Valid HQs': hqs + [''] * (max_len - len(hqs)),
                'Valid Factories': factories + [''] * (max_len - len(factories)),
                'Valid Departments': departments + [''] * (max_len - len(departments)),
            }
            pd.DataFrame(ref_data).to_excel(writer, sheet_name='Reference_Data', index=False)
        
        output.seek(0)
        filename = "Management_Review_Template.xlsx"
        response = HttpResponse(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename={filename}'
        return response

# =================== EXCEL UPLOAD ===================
class ManagementUploadExcelView(APIView):
    parser_classes = [MultiPartParser]
    
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not file.name.endswith(('.xlsx', '.xls')):
            return Response({"error": "File must be Excel (.xlsx, .xls)"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            try:
                df = pd.read_excel(file, sheet_name='Fill_Data_Here')
            except:
                df = pd.read_excel(file, sheet_name=0)
            
            df = df.where(pd.notnull(df), None)
            success_count = 0
            errors = []
            
            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        hq_obj = Hq.objects.filter(hq_name__iexact=row.get('HQ Name')).first()
                        factory_obj = Factory.objects.filter(factory_name__iexact=row.get('Factory Name')).first()
                       
                        if not factory_obj:
                            errors.append(f"Row {index+2}: Factory not found.")
                            continue
                        
                        dept_obj = Department.objects.filter(department_name__iexact=row.get('Department Name')).first()
                        line_obj = Line.objects.filter(line_name__iexact=row.get('Line Name')).first()
                        subline_obj = SubLine.objects.filter(subline_name__iexact=row.get('Subline Name')).first()
                        station_obj = Station.objects.filter(station_name__iexact=row.get('Station Name')).first()
                        
                        def get_val(val):
                            try:
                                return int(val) if val is not None else 0
                            except:
                                return 0
                        
                        def get_decimal(val):
                            try:
                                return float(val) if val is not None else None
                            except:
                                return None
                        
                        ManagementReview.objects.update_or_create(
                            hq=hq_obj,
                            factory=factory_obj,
                            department=dept_obj,
                            month=get_val(row.get('Month (1-12)')),
                            year=get_val(row.get('Year (YYYY)')),
                            defaults={
                                'line': line_obj,
                                'subline': subline_obj,
                                'station': station_obj,
                                'new_operators_joined': get_val(row.get('New Operators Joined')),
                                'new_operators_trained': get_val(row.get('New Operators Trained')),
                                'total_training_plans': get_val(row.get('Total Training Plans')),
                                'total_trainings_actual': get_val(row.get('Total Trainings Actual')),
                                'total_defects_msil': get_val(row.get('Total Defects MSIL')),
                                'ctq_defects_msil': get_val(row.get('CTQ Defects MSIL')),
                                'total_defects_tier1': get_val(row.get('Total Defects Tier1')),
                                'ctq_defects_tier1': get_val(row.get('CTQ Defects Tier1')),
                                'total_internal_rejection': get_val(row.get('Total Internal Rejection')),
                                'ctq_internal_rejection': get_val(row.get('CTQ Internal Rejection')),
                                'manpower_available': get_val(row.get('Manpower Available')),
                                'manpower_required': get_val(row.get('Manpower Required')),
                                'gca_defects': get_decimal(row.get('GCA Defects')),
                            }
                        )
                        success_count += 1
                    except Exception as e:
                        errors.append(f"Row {index+2}: Error - {str(e)}")
            
            return Response({
                "message": f"Processed {success_count} records successfully.",
                "errors": errors
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to parse: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =================== HELPER FUNCTIONS ===================
def apply_hierarchy_filters(request, queryset):
    """Apply hierarchy filters to queryset"""
    hq_id = request.query_params.get('hq')
    factory_id = request.query_params.get('factory')
    department_id = request.query_params.get('department')
    line_id = request.query_params.get('line')
    subline_id = request.query_params.get('subline')
    station_id = request.query_params.get('station')
    
    if hq_id and hq_id != 'null':
        queryset = queryset.filter(hq_id=hq_id)
    if factory_id and factory_id != 'null':
        queryset = queryset.filter(factory_id=factory_id)
    if department_id and department_id != 'null':
        queryset = queryset.filter(department_id=department_id)
    if line_id and line_id != 'null':
        queryset = queryset.filter(line_id=line_id)
    if subline_id and subline_id != 'null':
        queryset = queryset.filter(subline_id=subline_id)
    if station_id and station_id != 'null':
        queryset = queryset.filter(station_id=station_id)
    
    return queryset

def get_financial_year_filter(request):
    """
    Returns Q object for filtering financial year (Apr-Mar)
    If year param = 2025, returns: Apr 2025 - Mar 2026
    """
    year_param = request.query_params.get('year')
    
    if year_param:
        try:
            fy_start = int(year_param)
        except ValueError:
            fy_start = timezone.now().year
    else:
        now = timezone.now()
        fy_start = now.year if now.month >= 4 else now.year - 1
    
    fy_end = fy_start + 1
    
    # Return Q filter: (year=2025 AND month>=4) OR (year=2026 AND month<=3)
    return Q(year=fy_start, month__gte=4) | Q(year=fy_end, month__lte=3)

# =================== CURRENT MONTH SUMMARY CARDS ===================
class CurrentMonthTrainingDataView(APIView):
    """Summary card for training data (current month only)"""
    def get(self, request):
        current_time = timezone.now()
        queryset = ManagementReview.objects.filter(year=current_time.year, month=current_time.month)
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.aggregate(
            new_operators_joined=Sum('new_operators_joined'),
            new_operators_trained=Sum('new_operators_trained'),
            total_training_plans=Sum('total_training_plans'),
            total_trainings_actual=Sum('total_trainings_actual')
        )
        
        response_data = {key: value or 0 for key, value in data.items()}
        return Response(response_data, status=status.HTTP_200_OK)

class CurrentMonthDefectsDataView(APIView):
    """Summary card for defects data (current month only)"""
    def get(self, request):
        current_time = timezone.now()
        queryset = ManagementReview.objects.filter(year=current_time.year, month=current_time.month)
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.aggregate(
            total_defects_msil=Sum('total_defects_msil'),
            ctq_defects_msil=Sum('ctq_defects_msil'),
            total_defects_tier1=Sum('total_defects_tier1'),
            ctq_defects_tier1=Sum('ctq_defects_tier1'),
            total_internal_rejection=Sum('total_internal_rejection'),
            ctq_internal_rejection=Sum('ctq_internal_rejection')
        )
        
        response_data = {key: value or 0 for key, value in data.items()}
        return Response(response_data, status=status.HTTP_200_OK)

# =================== CHART VIEWS (FINANCIAL YEAR) ===================
class OperatorsChartView(APIView):
    """Operators Joined vs Trained - Financial Year"""
    def get(self, request):
        queryset = ManagementReview.objects.filter(get_financial_year_filter(request))
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.values('year', 'month').annotate(
            operators_joined=Sum('new_operators_joined'),
            operators_trained=Sum('new_operators_trained')
        ).order_by('year', 'month')
        
        formatted_data = []
        for item in data:
            formatted_data.append({
                'year': item['year'],
                'month': item['month'],
                'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
                'operators_joined': item['operators_joined'] or 0,
                'operators_trained': item['operators_trained'] or 0
            })
        
        return Response(formatted_data, status=status.HTTP_200_OK)

class TrainingPlansChartView(APIView):
    """Training Plans vs Actual - Financial Year"""
    def get(self, request):
        queryset = ManagementReview.objects.filter(get_financial_year_filter(request))
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.values('year', 'month').annotate(
            training_plans=Sum('total_training_plans'),
            trainings_actual=Sum('total_trainings_actual')
        ).order_by('year', 'month')
        
        formatted_data = []
        for item in data:
            formatted_data.append({
                'year': item['year'],
                'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
                'training_plans': item['training_plans'] or 0,
                'trainings_actual': item['trainings_actual'] or 0
            })
        
        return Response(formatted_data, status=status.HTTP_200_OK)

class DefectsChartView(APIView):
    """Man Related Defects Trend - Financial Year"""
    def get(self, request):
        queryset = ManagementReview.objects.filter(get_financial_year_filter(request))
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.values('year', 'month').annotate(
            defects_msil=Sum('total_defects_msil'),
            ctq_defects_msil=Sum('ctq_defects_msil')
        ).order_by('year', 'month')
        
        formatted_data = []
        for item in data:
            formatted_data.append({
                'year': item['year'],
                'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
                'defects_msil': item['defects_msil'] or 0,
                'ctq_defects_msil': item['ctq_defects_msil'] or 0
            })
        
        return Response(formatted_data, status=status.HTTP_200_OK)

class Tier1DefectsChartView(APIView):
    """Tier 1 Defects - Financial Year"""
    def get(self, request):
        queryset = ManagementReview.objects.filter(get_financial_year_filter(request))
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.values('year', 'month').annotate(
            total_tier1=Sum('total_defects_tier1'),
            ctq_tier1=Sum('ctq_defects_tier1')
        ).order_by('year', 'month')
        
        formatted_data = []
        for item in data:
            formatted_data.append({
                'year': item['year'],
                'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
                'total_defects_tier1': item['total_tier1'] or 0,
                'ctq_defects_tier1': item['ctq_tier1'] or 0
            })
        
        return Response(formatted_data, status=status.HTTP_200_OK)

class InternalRejectionChartView(APIView):
    """Internal Rejection Chart - Financial Year"""
    def get(self, request):
        queryset = ManagementReview.objects.filter(get_financial_year_filter(request))
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.values('year', 'month').annotate(
            internal_rej=Sum('total_internal_rejection'),
            ctq_rej=Sum('ctq_internal_rejection')
        ).order_by('year', 'month')
        
        formatted_data = []
        for item in data:
            formatted_data.append({
                'year': item['year'],
                'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
                'total_internal_rejection': item['internal_rej'] or 0,
                'ctq_internal_rejection': item['ctq_rej'] or 0
            })
        
        return Response(formatted_data, status=status.HTTP_200_OK)

class MonthPlanningChartView(APIView):
    """Manpower Planning - Financial Year"""
    def get(self, request):
        queryset = ManagementReview.objects.filter(get_financial_year_filter(request))
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.values('year', 'month').annotate(
            total_req=Sum('manpower_required'),
            total_avail=Sum('manpower_available')
        ).order_by('year', 'month')
        
        formatted_data = []
        for item in data:
            formatted_data.append({
                'year': item['year'],
                'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
                'manpower_required': item['total_req'] or 0,
                'manpower_available': item['total_avail'] or 0
            })
        
        return Response(formatted_data, status=status.HTTP_200_OK)

class GcaDefectsChartView(APIView):
    """GCA Defects Chart - Financial Year (Average)"""
    def get(self, request):
        queryset = ManagementReview.objects.filter(get_financial_year_filter(request))
        queryset = apply_hierarchy_filters(request, queryset)
        
        data = queryset.values('year', 'month').annotate(
            avg_gca=Avg('gca_defects')
        ).order_by('year', 'month')
        
        formatted_data = []
        for item in data:
            formatted_data.append({
                'year': item['year'],
                'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
                'gca_defects': round(float(item['avg_gca'] or 0), 2)
            })
        
        return Response(formatted_data, status=status.HTTP_200_OK)





# # views.py (CORRECTED) ====== management review ==========================================

# from django.utils import timezone
# from rest_framework import viewsets, status
# from rest_framework.views import APIView
# from rest_framework.response import Response

# from .models import ManagementReview
# from .serializers import (
#     ManagementReviewSerializer, TrainingDataSerializer, DefectsDataSerializer,
#     OperatorsChartSerializer, TrainingPlansChartSerializer, DefectsChartSerializer
# )

# class ManagementReviewViewSet(viewsets.ModelViewSet):
#     # This viewset is fine, no changes needed here.
#     queryset = ManagementReview.objects.all().select_related('hq', 'factory', 'department','line','subline','station')
#     serializer_class = ManagementReviewSerializer
#     pagination_class = None




# import pandas as pd
# import io
# from django.http import HttpResponse
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.parsers import MultiPartParser
# from django.db import transaction
# from .models import ManagementReview, Hq, Factory, Department, Line, SubLine, Station


# class ManagementDownloadTemplateView(APIView):
#     """
#     Generates an Excel template specifically for Management Review Data.
#     """
#     def get(self, request):
#         columns = [
#             'HQ Name', 'Factory Name', 'Department Name', 'Line Name', 
#             'Subline Name', 'Station Name', 'Month (1-12)', 'Year (YYYY)',
#             'New Operators Joined', 'New Operators Trained', 
#             'Total Training Plans', 'Total Trainings Actual',
#             'Total Defects MSIL', 'CTQ Defects MSIL',
#             'Total Defects Tier1', 'CTQ Defects Tier1',
#             'Total Internal Rejection', 'CTQ Internal Rejection',
#             # --- NEW FIELDS ADDED BELOW ---
#             'Manpower Available', 
#             'Manpower Required',
#             'GCA Defects' 
#         ]

#         output = io.BytesIO()
#         with pd.ExcelWriter(output, engine='openpyxl') as writer:
#             # Sheet 1: Data Entry
#             df_template = pd.DataFrame(columns=columns)
#             df_template.to_excel(writer, sheet_name='Fill_Data_Here', index=False)

#             # Sheet 2: Instructions
#             instructions = [
#                 ["Column", "Instruction"],
#                 ["Hierarchy", "Copy names exactly from 'Reference_Data' sheet."],
#                 ["Month/Year", "Numeric only (e.g., Month: 10, Year: 2025)."],
#                 ["Metrics", "Numeric integers only. Use 0 for empty values."],
#                 ["GCA Defects", "Decimal numbers allowed (e.g., 12.5)."],
#             ]
#             pd.DataFrame(instructions[1:], columns=instructions[0]).to_excel(writer, sheet_name='Instructions', index=False)

#             # Sheet 3: Reference Data
#             # --- FIX IS HERE: Changed 'name' to 'hq_name' ---
#             hqs = list(Hq.objects.values_list('hq_name', flat=True))
#             factories = list(Factory.objects.values_list('factory_name', flat=True))
#             departments = list(Department.objects.values_list('department_name', flat=True))
            
#             max_len = max(len(hqs), len(factories), len(departments))
#             ref_data = {
#                 'Valid HQs': hqs + [''] * (max_len - len(hqs)),
#                 'Valid Factories': factories + [''] * (max_len - len(factories)),
#                 'Valid Departments': departments + [''] * (max_len - len(departments)),
#             }
#             pd.DataFrame(ref_data).to_excel(writer, sheet_name='Reference_Data', index=False)

#         output.seek(0)
#         filename = "Management_Review_Template.xlsx"
#         response = HttpResponse(
#             output,
#             content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
#         )
#         response['Content-Disposition'] = f'attachment; filename={filename}'
#         return response

# class ManagementUploadExcelView(APIView):
#     """
#     Handles bulk upload for Management Review including new Manpower and GCA fields.
#     """
#     parser_classes = [MultiPartParser]

#     def post(self, request):
#         file = request.FILES.get('file')
#         if not file:
#             return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

#         if not file.name.endswith(('.xlsx', '.xls')):
#             return Response({"error": "File must be Excel (.xlsx, .xls)"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             try:
#                 df = pd.read_excel(file, sheet_name='Fill_Data_Here')
#             except:
#                 df = pd.read_excel(file, sheet_name=0)

#             # Convert NaN to None for easier handling
#             df = df.where(pd.notnull(df), None)
#             success_count = 0
#             errors = []

#             with transaction.atomic():
#                 for index, row in df.iterrows():
#                     try:
#                         # Hierarchy Lookup
#                         hq_obj = Hq.objects.filter(hq_name__iexact=row.get('HQ Name')).first()
#                         factory_obj = Factory.objects.filter(factory_name__iexact=row.get('Factory Name')).first()
                        
#                         if not factory_obj:
#                             errors.append(f"Row {index+2}: Factory not found.")
#                             continue

#                         dept_obj = Department.objects.filter(department_name__iexact=row.get('Department Name')).first()
#                         line_obj = Line.objects.filter(line_name__iexact=row.get('Line Name')).first()
#                         subline_obj = SubLine.objects.filter(subline_name__iexact=row.get('Subline Name')).first()
#                         station_obj = Station.objects.filter(station_name__iexact=row.get('Station Name')).first()

#                         # --- Helpers for Data Conversion ---

#                         # 1. Helper for Integers (Defaults to 0 if missing)
#                         def get_val(val): 
#                             try:
#                                 return int(val) if val is not None else 0
#                             except:
#                                 return 0

#                         # 2. Helper for Decimals (For GCA Defects) - Defaults to None or 0.0
#                         def get_decimal(val):
#                             try:
#                                 return float(val) if val is not None else None
#                             except:
#                                 return None

#                         # --- Update or Create ---
#                         ManagementReview.objects.update_or_create(
#                             hq=hq_obj,
#                             factory=factory_obj,
#                             department=dept_obj,
#                             month=get_val(row.get('Month (1-12)')),
#                             year=get_val(row.get('Year (YYYY)')),
#                             defaults={
#                                 'line': line_obj,
#                                 'subline': subline_obj,
#                                 'station': station_obj,
#                                 'new_operators_joined': get_val(row.get('New Operators Joined')),
#                                 'new_operators_trained': get_val(row.get('New Operators Trained')),
#                                 'total_training_plans': get_val(row.get('Total Training Plans')),
#                                 'total_trainings_actual': get_val(row.get('Total Trainings Actual')),
#                                 'total_defects_msil': get_val(row.get('Total Defects MSIL')),
#                                 'ctq_defects_msil': get_val(row.get('CTQ Defects MSIL')),
#                                 'total_defects_tier1': get_val(row.get('Total Defects Tier1')),
#                                 'ctq_defects_tier1': get_val(row.get('CTQ Defects Tier1')),
#                                 'total_internal_rejection': get_val(row.get('Total Internal Rejection')),
#                                 'ctq_internal_rejection': get_val(row.get('CTQ Internal Rejection')),
                                
#                                 # --- NEW FIELDS MAPPED HERE ---
#                                 'manpower_available': get_val(row.get('Manpower Available')),
#                                 'manpower_required': get_val(row.get('Manpower Required')),
#                                 'gca_defects': get_decimal(row.get('GCA Defects')),
#                             }
#                         )
#                         success_count += 1
#                     except Exception as e:
#                         errors.append(f"Row {index+2}: Error - {str(e)}")

#             return Response({
#                 "message": f"Processed {success_count} records successfully.",
#                 "errors": errors
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": f"Failed to parse: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
       

# from django.db.models import Sum
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import ManagementReview

# # --- Helper function to apply filters ---
# def apply_hierarchy_filters(request, queryset):
#     # Get parameters
#     hq_id = request.query_params.get('hq')
#     factory_id = request.query_params.get('factory')
#     department_id = request.query_params.get('department')
#     line_id = request.query_params.get('line')
#     subline_id = request.query_params.get('subline')
#     station_id = request.query_params.get('station')

#     # Apply filters ONLY if value exists and is not 'null'
#     if hq_id and hq_id != 'null':
#         queryset = queryset.filter(hq_id=hq_id)
        
#     if factory_id and factory_id != 'null':
#         queryset = queryset.filter(factory_id=factory_id)
        
#     if department_id and department_id != 'null':
#         queryset = queryset.filter(department_id=department_id)
        
#     if line_id and line_id != 'null':
#         queryset = queryset.filter(line_id=line_id)
        
#     if subline_id and subline_id != 'null':
#         queryset = queryset.filter(subline_id=subline_id)
        
#     if station_id and station_id != 'null':
#         queryset = queryset.filter(station_id=station_id)
    
#     return queryset

# # 1. View for the Training Summary Card
# class CurrentMonthTrainingDataView(APIView):
#     def get(self, request):
#         current_time = timezone.now()
        
#         # Start with current month filter
#         queryset = ManagementReview.objects.filter(
#             year=current_time.year,
#             month=current_time.month
#         )

#         # Apply hierarchy
#         queryset = apply_hierarchy_filters(request, queryset)

#         # Aggregate (Sum)
#         data = queryset.aggregate(
#             new_operators_joined=Sum('new_operators_joined'),
#             new_operators_trained=Sum('new_operators_trained'),
#             total_training_plans=Sum('total_training_plans'),
#             total_trainings_actual=Sum('total_trainings_actual')
#         )

#         # Clean up None values (convert to 0)
#         response_data = {
#             key: value or 0 for key, value in data.items()
#         }

#         return Response(response_data, status=status.HTTP_200_OK)


# # 2. View for the Defects Summary Card
# class CurrentMonthDefectsDataView(APIView):
#     def get(self, request):
#         current_time = timezone.now()
        
#         queryset = ManagementReview.objects.filter(
#             year=current_time.year,
#             month=current_time.month
#         )

#         queryset = apply_hierarchy_filters(request, queryset)

#         data = queryset.aggregate(
#             total_defects_msil=Sum('total_defects_msil'),
#             ctq_defects_msil=Sum('ctq_defects_msil'),
#             total_defects_tier1=Sum('total_defects_tier1'),
#             ctq_defects_tier1=Sum('ctq_defects_tier1'),
#             total_internal_rejection=Sum('total_internal_rejection'),
#             ctq_internal_rejection=Sum('ctq_internal_rejection')
#         )

#         response_data = {
#             key: value or 0 for key, value in data.items()
#         }

#         return Response(response_data, status=status.HTTP_200_OK)




# from django.db.models import Sum
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import ManagementReview

# class InternalRejectionChartView(APIView):
#     def get(self, request):
#         # 1. Determine Year
#         req_year = request.query_params.get('year')
#         if req_year:
#             target_year = int(req_year)
#         else:
#             target_year = timezone.now().year
            
#         queryset = ManagementReview.objects.filter(year=target_year)

#         # 2. Apply Hierarchy Filters
#         queryset = apply_hierarchy_filters(request, queryset)

#         # 3. Aggregate Data (Sum)
#         data = queryset.values('year', 'month').annotate(
#             internal_rej=Sum('total_internal_rejection'),
#             ctq_rej=Sum('ctq_internal_rejection')
#         ).order_by('year', 'month')

#         # 4. Format Response
#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'year': item['year'],
#                 'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
#                 'total_internal_rejection': item['internal_rej'] or 0,
#                 'ctq_internal_rejection': item['ctq_rej'] or 0
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)



# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from django.db.models import Sum, Q # Import Q here
# from django.utils import timezone
# from .models import ManagementReview

# class OperatorsChartView(APIView):
#     def get(self, request):
#         # 1. Determine Financial Year Start
#         req_year = request.query_params.get('year')
        
#         if req_year:
#             start_year = int(req_year)
#         else:
#             now = timezone.now()
#             # If current month is Jan(1), Feb(2), or Mar(3), the FY started in previous year
#             if now.month < 4:
#                 start_year = now.year - 1
#             else:
#                 start_year = now.year
        
#         end_year = start_year + 1

#         # 2. Filter for Financial Year Range (Apr start_year TO Mar end_year)
#         # Logic: (Year == 2025 AND Month >= 4) OR (Year == 2026 AND Month <= 3)
#         queryset = ManagementReview.objects.filter(
#             Q(year=start_year, month__gte=4) | 
#             Q(year=end_year, month__lte=3)
#         )

#         # 3. Apply Hierarchy Filters (Your existing helper function)
#         queryset = apply_hierarchy_filters(request, queryset)

#         # 4. Aggregation
#         data = queryset.values('year', 'month').annotate(
#             operators_joined=Sum('new_operators_joined'),
#             operators_trained=Sum('new_operators_trained')
#         ).order_by('year', 'month')

#         # 5. Format Response
#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'year': item['year'],
#                 'month': item['month'], # Send raw integer month (1-12) for easier frontend mapping
#                 'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
#                 'operators_joined': item['operators_joined'] or 0,
#                 'operators_trained': item['operators_trained'] or 0
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)  
    






# from .models import ManagementReview # Importing the correct model

# class MonthPlanningChartView(APIView):
#     def get(self, request):
#         # 1. Year Logic (Default to current year if not provided)
#         req_year = request.query_params.get('year')
#         target_year = int(req_year) if req_year else timezone.now().year
        
#         # 2. Base Query on ManagementReview
#         queryset = ManagementReview.objects.filter(year=target_year)

#         # 3. Apply Hierarchy Filters (Uses the same helper)
#         queryset = apply_hierarchy_filters(request, queryset)

#         # 4. Aggregate Data (Sum)
#         data = queryset.values('year', 'month').annotate(
#             total_req=Sum('manpower_required'),
#             total_avail=Sum('manpower_available')
#         ).order_by('year', 'month')

#         # 5. Format Response
#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'year': item['year'],
#                 'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
#                 'manpower_required': item['total_req'] or 0,
#                 'manpower_available': item['total_avail'] or 0
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)


# from django.db.models import Avg # Import Avg
# from django.db.models import Avg

# class GcaDefectsChartView(APIView):
#     def get(self, request):
#         # 1. Determine Year
#         req_year = request.query_params.get('year')
#         target_year = int(req_year) if req_year else timezone.now().year
        
#         queryset = ManagementReview.objects.filter(year=target_year)

#         # 2. Apply Hierarchy Filters (Using the helper we created)
#         queryset = apply_hierarchy_filters(request, queryset)

#         # 3. Aggregate Data
#         # We use Avg (Average) because GCA is a defect score/rate. 
#         # Summing rates (0.1 + 0.1 = 0.2) is usually incorrect for dashboards.
#         data = queryset.values('year', 'month').annotate(
#             avg_gca=Avg('gca_defects')
#         ).order_by('year', 'month')

#         # 4. Format Response
#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'year': item['year'],
#                 'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
#                 'gca_defects': round(float(item['avg_gca'] or 0), 2)
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)
    


# from django.db.models import Sum
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import ManagementReview
# # --- UPDATED VIEW FOR PLAN VS ACTUAL ---
# class TrainingPlansChartView(APIView):
#     def get(self, request):
#         # 1. Year Logic
#         req_year = request.query_params.get('year')
#         if req_year:
#             target_year = int(req_year)
#         else:
#             target_year = timezone.now().year
            
#         queryset = ManagementReview.objects.filter(year=target_year)

#         # 2. Apply Hierarchy Filters (Uses the "All" logic)
#         # If frontend sends empty string or no param for 'line', this SKIPS the filter.
#         # This means it includes records where line is NULL + records where line is Specific.
#         queryset = apply_hierarchy_filters(request, queryset)

#         # 3. Aggregate Data (Sum)
#         data = queryset.values('year', 'month').annotate(
#             training_plans=Sum('total_training_plans'),
#             trainings_actual=Sum('total_trainings_actual')
#         ).order_by('year', 'month')

#         # 4. Format Response
#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'year': item['year'],
#                 'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
#                 'training_plans': item['training_plans'] or 0,
#                 'trainings_actual': item['trainings_actual'] or 0
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)


# # class DefectsChartView(APIView):
# #     def get(self, request):
# #         current_year = timezone.now().year
# #         data = ManagementReview.objects.filter(
# #             year=current_year  # FIX: Changed from month_year__year
# #         ).order_by('year', 'month')  # FIX: Changed from 'month_year'
# #         serializer = DefectsChartSerializer(data, many=True)
# #         return Response(serializer.data, status=status.HTTP_200_OK)
    
# from django.db.models import Sum
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import ManagementReview

# class DefectsChartView(APIView):
#     def get(self, request):
#         # 1. Determine Year
#         req_year = request.query_params.get('year')
#         if req_year:
#             target_year = int(req_year)
#         else:
#             target_year = timezone.now().year
            
#         queryset = ManagementReview.objects.filter(year=target_year)

#         queryset = apply_hierarchy_filters(request, queryset)

#         # 3. Aggregate Data (Sum)
#         data = queryset.values('year', 'month').annotate(
#             defects_msil=Sum('total_defects_msil'),
#             ctq_defects_msil=Sum('ctq_defects_msil')
#         ).order_by('year', 'month')

#         # 4. Format Response
#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'year': item['year'],
#                 'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
#                 'defects_msil': item['defects_msil'] or 0,
#                 'ctq_defects_msil': item['ctq_defects_msil'] or 0
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)    





# from django.db.models import Sum
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import ManagementReview

# class Tier1DefectsChartView(APIView):
#     def get(self, request):
#         # 1. Determine Year (Default to System Year)
#         req_year = request.query_params.get('year')
#         if req_year:
#             target_year = int(req_year)
#         else:
#             target_year = timezone.now().year
            
#         queryset = ManagementReview.objects.filter(year=target_year)

#         queryset = apply_hierarchy_filters(request, queryset)

#         # 3. Aggregate Data (Sum Tier 1 fields)
#         data = queryset.values('year', 'month').annotate(
#             total_tier1=Sum('total_defects_tier1'),
#             ctq_tier1=Sum('ctq_defects_tier1')
#         ).order_by('year', 'month')

#         # 4. Format Response
#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'year': item['year'],
#                 'month_year': f"{item['year']}-{str(item['month']).zfill(2)}",
#                 'total_defects_tier1': item['total_tier1'] or 0,
#                 'ctq_defects_tier1': item['ctq_tier1'] or 0
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)


# # =============================end of management reviw graph ===============================










# =================================== Advance manpower =======================================


import pandas as pd
import io
from django.http import HttpResponse
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

# Import your models and serializers
from .models import (
    AdvanceManpowerDashboard, Hq, Factory, Department, Line, SubLine, Station
)
from .serializers import AdvanceManpowerDashboardSerializer

class AdvanceManpowerDashboardViewSet(viewsets.ModelViewSet):
    queryset = AdvanceManpowerDashboard.objects.all()
    serializer_class = AdvanceManpowerDashboardSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        hq_id = self.request.query_params.get('hq')
        factory_id = self.request.query_params.get('factory')
        department_id = self.request.query_params.get('department')
        line_id = self.request.query_params.get('line')
        subline_id = self.request.query_params.get('subline')
        station_id = self.request.query_params.get('station')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if hq_id and hq_id != 'null': queryset = queryset.filter(hq_id=hq_id)
        if factory_id and factory_id != 'null': queryset = queryset.filter(factory_id=factory_id)
        if department_id and department_id != 'null': queryset = queryset.filter(department_id=department_id)
        if line_id and line_id != 'null': queryset = queryset.filter(line_id=line_id)
        if subline_id and subline_id != 'null': queryset = queryset.filter(subline_id=subline_id)
        if station_id and station_id != 'null': queryset = queryset.filter(station_id=station_id)
        
        if month and month != 'null': queryset = queryset.filter(month=month)
        if year and year != 'null': queryset = queryset.filter(year=year)
        
        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        # Extract IDs
        hq_id = data.get('hq')
        factory_id = data.get('factory')
        department_id = data.get('department')
        line_id = data.get('line')
        subline_id_input = data.get('subline')
        station_id = data.get('station')
        
        month = data.get('month')
        year = data.get('year')

        # LOGIC: If Line is selected, but Station is "All" (null)
        if line_id and (not station_id or station_id == 'null'):
            
            # 1. Query the HIERARCHY table, not the Station table.
            # The Hierarchy table contains the mapping: Line -> Stations
            hierarchy_qs = HierarchyStructure.objects.filter(line_id=line_id)
            
            # Filter by subline only if the user specifically selected one
            if subline_id_input and subline_id_input != 'null':
                hierarchy_qs = hierarchy_qs.filter(subline_id=subline_id_input)

            # Ensure we actually found stations
            if not hierarchy_qs.exists():
                return Response(
                    {"error": "No stations found in Hierarchy for this Line."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            created_instances = []

            # 2. Loop through the Hierarchy records found
            for h_entry in hierarchy_qs:
                # h_entry is a Hierarchy object containing .station, .subline, etc.
                
                target_station = h_entry.station
                if not target_station:
                    continue # Skip if hierarchy entry has no station

                # Prepare data for this specific station
                station_data = data.copy()
                station_data['station'] = target_station.station_id
                
                # CRITICAL: Use the Subline from the Hierarchy entry.
                # This ensures that if the station belongs to a subline, it gets saved correctly
                # even if the user selected "All" sublines.
                station_data['subline'] = h_entry.subline_id if h_entry.subline else None

                # 3. Update or Create Logic
                existing_record = AdvanceManpowerDashboard.objects.filter(
                    hq_id=hq_id,
                    factory_id=factory_id,
                    department_id=department_id,
                    line_id=line_id,
                    # Match the subline strictly to the hierarchy's definition
                    subline_id=station_data['subline'], 
                    station_id=target_station.station_id,
                    month=month,
                    year=year
                ).first()

                if existing_record:
                    # Update existing record
                    serializer = self.get_serializer(existing_record, data=station_data, partial=True)
                else:
                    # Create new record
                    serializer = self.get_serializer(data=station_data)

                if serializer.is_valid():
                    serializer.save()
                    created_instances.append(serializer.data)
                else:
                    print(f"Error saving station {target_station.id}: {serializer.errors}")

            return Response(created_instances, status=status.HTTP_201_CREATED)

        # Normal Create (Single specific station selected)
        return super().create(request, *args, **kwargs)

    # --- 1. EXCEL DOWNLOAD TEMPLATE (MULTI-SHEET) ---
    @action(detail=False, methods=['get'], url_path='download-template')
    def download_template(self, request):
        """
        Generates an Excel template with 3 sheets: Data, Instructions, Reference Data.
        """
        # --- SHEET 1: DATA HEADERS ---
        headers = [
            'hq_name', 'factory_name', 'department_name', 
            'line_name', 'subline_name', 'station_name',
            'month', 'year',
            'total_stations', 'operators_required',
            'buffer_manpower_required', 'buffer_manpower_available',
            'l1_required',
            'l2_required',  
            'l3_required',  
            'l4_required',  
            'attrition_rate'
        ]
        
        # Example Data
        dummy_data = [
            {
                'hq_name': 'Corporate HQ', 'factory_name': 'Main Plant', 'department_name': 'Assembly',
                'line_name': 'Line A', 'subline_name': 'Sub A1', 'station_name': 'Station 101',
                'month': 1, 'year': 2025, 
                'total_stations': 1, 'operators_required': 10, 'operators_available': 8,
                'buffer_manpower_required': 2, 'buffer_manpower_available': 1,
                'l1_required': 5, 'l1_available': 4, 'l2_required': 3, 'l2_available': 3,
                'l3_required': 1, 'l3_available': 1, 'l4_required': 1, 'l4_available': 0,
                'attrition_rate': 0.05, 'absenteeism_rate': 0.02, 
            },
            {
                'hq_name': 'Corporate HQ', 'factory_name': 'Main Plant', 'department_name': 'Logistics',
                'line_name': '', 'subline_name': '', 'station_name': '', # Empty means "All"
                'month': 1, 'year': 2025, 
                'total_stations': 50, 'operators_required': 50, 'operators_available': 45,
                'buffer_manpower_required': 5, 'buffer_manpower_available': 2,
                'l1_required': 20, 'l1_available': 18, 'l2_required': 10, 'l2_available': 10,
                'l3_required': 10, 'l3_available': 9, 'l4_required': 10, 'l4_available': 8,
                'attrition_rate': 0.10, 'absenteeism_rate': 0.05,
            },
        ]

        # --- SHEET 2: INSTRUCTIONS ---
        instructions = [
            ["Column", "Instruction"],
            ["Hierarchy Names", "Copy names EXACTLY from the 'Reference_Data' sheet to avoid errors."],
            ["Hierarchy Logic", "To select 'All' for a level (e.g., All Lines), leave that column EMPTY."],
            ["Mandatory", "Factory Name, Month, and Year are mandatory."],
            ["Numeric Fields", "Enter integers for counts. Enter decimals (0.0 - 1.0) or percentages for rates."],
            ["Duplicates", "If a record exists for the same Factory/Dept/Line/Date, it will be updated."]
        ]

        # --- SHEET 3: REFERENCE DATA ---
        # Fetch all valid names from DB
        hqs = list(Hq.objects.values_list('hq_name', flat=True))
        factories = list(Factory.objects.values_list('factory_name', flat=True))
        departments = list(Department.objects.values_list('department_name', flat=True))
        lines = list(Line.objects.values_list('line_name', flat=True))
        sublines = list(SubLine.objects.values_list('subline_name', flat=True))
        stations = list(Station.objects.values_list('station_name', flat=True))

        # Find max length to frame the DataFrame
        max_len = max(len(hqs), len(factories), len(departments), len(lines), len(sublines), len(stations))

        ref_data = {
            'Valid HQs': hqs + [''] * (max_len - len(hqs)),
            'Valid Factories': factories + [''] * (max_len - len(factories)),
            'Valid Departments': departments + [''] * (max_len - len(departments)),
            'Valid Lines': lines + [''] * (max_len - len(lines)),
            'Valid Sublines': sublines + [''] * (max_len - len(sublines)),
            'Valid Stations': stations + [''] * (max_len - len(stations)),
        }

        # --- BUILD EXCEL FILE ---
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            pd.DataFrame(dummy_data, columns=headers).to_excel(writer, sheet_name='Fill_Data_Here', index=False)
            pd.DataFrame(instructions[1:], columns=instructions[0]).to_excel(writer, sheet_name='Instructions', index=False)
            pd.DataFrame(ref_data).to_excel(writer, sheet_name='Reference_Data', index=False)
        
        output.seek(0)
        
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="manpower_planning_template.xlsx"'
        return response

        # --- EXCEL UPLOAD ---
    @action(detail=False, methods=['post'], url_path='upload-data')
    @transaction.atomic
    def upload_data(self, request):
        """
        Accepts Excel. 
        Logic:
        1. If Station Name is provided -> Update/Create specific station.
        2. If Station Name is EMPTY but Line Name provided -> Update/Create all stations in that line.
        3. If BOTH are EMPTY -> Update/Create a generic record (Null line/station) for the Factory.
        """
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file_obj, na_filter=False)
        except Exception as e:
            return Response({"error": f"Error reading Excel file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize headers
        df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]

        required_columns = {'factory_name', 'month', 'year'}
        if not required_columns.issubset(df.columns):
            return Response({"error": f"Missing mandatory columns: {required_columns - set(df.columns)}"}, status=status.HTTP_400_BAD_REQUEST)

        errors = []
        created_count = 0
        updated_count = 0

        def get_val(row, key, is_float=False):
            val = row.get(key, 0)
            if val == '': return 0.0 if is_float else 0
            try:
                return float(val) if is_float else int(val)
            except:
                return 0.0 if is_float else 0

        for index, row in df.iterrows():
            row_num = index + 2
            try:
                # 1. Clean Inputs
                hq_name = str(row.get('hq_name', '')).strip()
                factory_name = str(row.get('factory_name', '')).strip()
                department_name = str(row.get('department_name', '')).strip()
                line_name = str(row.get('line_name', '')).strip()
                subline_name = str(row.get('subline_name', '')).strip()
                station_name = str(row.get('station_name', '')).strip()

                month = int(row['month'])
                year = int(row['year'])

                # 2. Resolve Hierarchy Objects
                factory = Factory.objects.filter(factory_name__iexact=factory_name).first()
                if not factory:
                    errors.append(f"Row {row_num}: Factory '{factory_name}' not found.")
                    continue

                hq = None
                if hq_name:
                    hq = Hq.objects.filter(hq_name__iexact=hq_name).first()

                department = None
                if department_name:
                    department = Department.objects.filter(department_name__iexact=department_name).first()

                # Try to find Line if name provided, otherwise None
                line = None
                if line_name:
                    line = Line.objects.filter(line_name__iexact=line_name).first()
                    if not line:
                        errors.append(f"Row {row_num}: Line '{line_name}' not found.")
                        continue
                
                subline = None
                if subline_name:
                    subline = SubLine.objects.filter(subline_name__iexact=subline_name).first()

                # 3. Prepare Metric Defaults
                defaults = {
                    'total_stations': get_val(row, 'total_stations'),
                    'operators_required': get_val(row, 'operators_required'),
                    'buffer_manpower_required': get_val(row, 'buffer_manpower_required'),
                    'buffer_manpower_available': get_val(row, 'buffer_manpower_available'),
                    'l1_required': get_val(row, 'l1_required'),
                    'l2_required': get_val(row, 'l2_required'),
                    'l3_required': get_val(row, 'l3_required'),
                    'l4_required': get_val(row, 'l4_required'),
                    'attrition_rate': get_val(row, 'attrition_rate', True),
                }

                # ============================================================
                # SCENARIO A: Station Name PROVIDED
                # ============================================================
                if station_name:
                    station_obj = Station.objects.filter(station_name__iexact=station_name).first()
                    if not station_obj:
                        errors.append(f"Row {row_num}: Station '{station_name}' not found.")
                        continue
                    
                    obj, created = AdvanceManpowerDashboard.objects.update_or_create(
                        hq=hq,
                        factory=factory,
                        department=department,
                        line=line,
                        subline=subline,
                        station_id=station_obj.pk,
                        month=month,
                        year=year,
                        defaults=defaults
                    )
                    if created: created_count += 1
                    else: updated_count += 1

                # ============================================================
                # SCENARIO B: Station Name EMPTY but Line Name PROVIDED (Bulk Update)
                # ============================================================
                elif line:
                    hierarchy_qs = HierarchyStructure.objects.filter(line=line)
                    
                    if subline:
                        hierarchy_qs = hierarchy_qs.filter(subline=subline)

                    if not hierarchy_qs.exists():
                        errors.append(f"Row {row_num}: No stations found in Hierarchy for Line '{line_name}'.")
                        continue
                    
                    processed_station_ids = set()

                    for h_entry in hierarchy_qs:
                        target_station = h_entry.station
                        if not target_station: continue
                        if target_station.pk in processed_station_ids: continue
                        
                        processed_station_ids.add(target_station.pk)
                        actual_subline = h_entry.subline if h_entry.subline else subline

                        obj, created = AdvanceManpowerDashboard.objects.update_or_create(
                            hq=hq,
                            factory=factory,
                            department=department,
                            line=line,
                            subline=actual_subline,
                            station_id=target_station.pk,
                            month=month,
                            year=year,
                            defaults=defaults
                        )
                        if created: created_count += 1
                        else: updated_count += 1
                
                # ============================================================
                # SCENARIO C: Both Station AND Line are EMPTY -> Create Generic Record (Nulls)
                # ============================================================
                else:
                    # If Excel cells were empty, 'line', 'subline', 'department' are already None
                    # We explicitly pass station_id=None
                    obj, created = AdvanceManpowerDashboard.objects.update_or_create(
                        hq=hq,
                        factory=factory,
                        department=department, # Will be None if cell was empty
                        line=None,             # Explicitly None
                        subline=subline,       # Will be None if cell was empty
                        station_id=None,       # Explicitly None
                        month=month,
                        year=year,
                        defaults=defaults
                    )
                    if created: created_count += 1
                    else: updated_count += 1

            except Exception as e:
                errors.append(f"Row {row_num}: Unexpected error: {str(e)}")

        if errors:
            transaction.set_rollback(True)
            return Response({
                "status": "Error",
                "message": "Upload failed. No data saved.",
                "errors": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "status": "Success",
            "message": "Data uploaded successfully.",
            "records_created": created_count,
            "records_updated": updated_count,
        }, status=status.HTTP_201_CREATED)
    


     # Existing helper actions...
    @action(detail=False, methods=["get"])
    def department_wise_stations(self, request):
        data = (
            AdvanceManpowerDashboard.objects
            .values("department__id", "department__department_name")
            .annotate(total_stations=Sum("total_stations"))
        )
        return Response(data)

    @action(detail=False, methods=["get"])
    def department_month_year(self, request):
        # You might want to update this to filter by line/subline too if needed
        qs = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)






# --- NEW CHART VIEW ---
class AdvancedManpowerTrendChartView(APIView):
    def get(self, request):
        # 1. Determine Year (Default to current)
        req_year = request.query_params.get('year')
        target_year = int(req_year) if req_year else timezone.now().year
        
        # 2. Base Query
        queryset = AdvanceManpowerDashboard.objects.filter(year=target_year)

        # 3. Apply Hierarchy Filters (Handles "All" automatically)
        queryset = apply_hierarchy_filters(request, queryset)

        # 4. Aggregate Data by Month
        data = queryset.values('year', 'month').annotate(
            total_required=Sum('operators_required'),
            total_available=Sum('operators_available')
        ).order_by('year', 'month')

        # 5. Format Response
        formatted_data = []
        for item in data:
            formatted_data.append({
                'month': item['month'],
                'year': item['year'],
                'operators_required': item['total_required'] or 0,
                'operators_available': item['total_available'] or 0
            })

        return Response(formatted_data, status=status.HTTP_200_OK)
    


# from django.db.models import Avg
# # ... other imports ...

# # --- NEW VIEW FOR ATTRITION (Uses Average) ---
# class AttritionChartView(APIView):
#     def get(self, request):
#         req_year = request.query_params.get('year')
#         target_year = int(req_year) if req_year else timezone.now().year
        
#         queryset = AdvanceManpowerDashboard.objects.filter(year=target_year)

#         # Use the same helper for hierarchy filtering
#         queryset = apply_hierarchy_filters(request, queryset)

#         # Aggregate Data (AVERAGE for Rates)
#         data = queryset.values('year', 'month').annotate(
#             avg_attrition=Avg('attrition_rate')
#         ).order_by('year', 'month')

#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'month': item['month'],
#                 'year': item['year'],
#                 # Return as float, default to 0.0
#                 'attrition_rate': round(float(item['avg_attrition'] or 0), 2)
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)
    



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Q
from django.utils import timezone
from .models import AdvanceManpowerDashboard 
# Import your apply_hierarchy_filters helper here

class AttritionChartView(APIView):
    def get(self, request):
        # 1. Determine Financial Year Start
        req_year = request.query_params.get('year')
        
        if req_year:
            start_year = int(req_year)
        else:
            now = timezone.now()
            # If Jan, Feb, Mar -> FY started in previous year
            if now.month < 4:
                start_year = now.year - 1
            else:
                start_year = now.year
        
        end_year = start_year + 1

        # 2. Filter for Financial Year Range 
        # (Apr-Dec of StartYear) OR (Jan-Mar of EndYear)
        queryset = AdvanceManpowerDashboard.objects.filter(
            Q(year=start_year, month__gte=4) | 
            Q(year=end_year, month__lte=3)
        )

        # 3. Apply Hierarchy Filters
        queryset = apply_hierarchy_filters(request, queryset)

        # 4. Aggregation
        data = queryset.values('year', 'month').annotate(
            avg_attrition=Avg('attrition_rate')
        ).order_by('year', 'month')

        # 5. Format Response
        formatted_data = []
        for item in data:
            formatted_data.append({
                'month': item['month'], # Returns 1-12
                'year': item['year'],
                'attrition_rate': round(float(item['avg_attrition'] or 0), 2)
            })

        return Response(formatted_data, status=status.HTTP_200_OK)




# # --- BUFFER MANPOWER CHART VIEW ---
# class BufferManpowerChartView(APIView):
#     def get(self, request):
#         req_year = request.query_params.get('year')
#         target_year = int(req_year) if req_year else timezone.now().year
        
#         queryset = AdvanceManpowerDashboard.objects.filter(year=target_year)

#         # Use Helper
#         queryset = apply_hierarchy_filters(request, queryset)

#         # Aggregate Sums
#         data = queryset.values('year', 'month').annotate(
#             required=Sum('buffer_manpower_required'),
#             available=Sum('buffer_manpower_available')
#         ).order_by('year', 'month')

#         formatted_data = []
#         for item in data:
#             formatted_data.append({
#                 'month': item['month'],
#                 'year': item['year'],
#                 'buffer_manpower_required': item['required'] or 0,
#                 'buffer_manpower_available': item['available'] or 0
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)
    


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Q
from django.utils import timezone
from .models import AdvanceManpowerDashboard
# Import your apply_hierarchy_filters helper

class BufferManpowerChartView(APIView):
    def get(self, request):
        # 1. Determine Financial Year Start
        req_year = request.query_params.get('year')
        
        if req_year:
            start_year = int(req_year)
        else:
            now = timezone.now()
            # If current month is Jan(1), Feb(2), or Mar(3), FY started last year
            if now.month < 4:
                start_year = now.year - 1
            else:
                start_year = now.year
        
        end_year = start_year + 1

        # 2. Filter for Financial Year Range 
        # (Apr-Dec of StartYear) OR (Jan-Mar of EndYear)
        queryset = AdvanceManpowerDashboard.objects.filter(
            Q(year=start_year, month__gte=4) | 
            Q(year=end_year, month__lte=3)
        )

        # 3. Apply Hierarchy Filters
        queryset = apply_hierarchy_filters(request, queryset)

        # 4. Aggregate Sums
        data = queryset.values('year', 'month').annotate(
            required=Sum('buffer_manpower_required'),
            available=Sum('buffer_manpower_available')
        ).order_by('year', 'month')

        # 5. Format Response
        formatted_data = []
        for item in data:
            formatted_data.append({
                'month': item['month'], # Returns 1-12
                'year': item['year'],
                'buffer_manpower_required': item['required'] or 0,
                'buffer_manpower_available': item['available'] or 0
            })

        return Response(formatted_data, status=status.HTTP_200_OK)



# --- ABSENTEEISM CHART VIEW (Uses Average) ---
class AbsenteeismChartView(APIView):
    def get(self, request):
        req_year = request.query_params.get('year')
        target_year = int(req_year) if req_year else timezone.now().year
        
        queryset = AdvanceManpowerDashboard.objects.filter(year=target_year)

        # Use Helper
        queryset = apply_hierarchy_filters(request, queryset)

        # Aggregate (Avg)
        data = queryset.values('year', 'month').annotate(
            avg_absenteeism=Avg('absenteeism_rate')
        ).order_by('year', 'month')

        formatted_data = []
        for item in data:
            formatted_data.append({
                'month': item['month'],
                'year': item['year'],
                # Return as float, default to 0.0
                'absenteeism_rate': round(float(item['avg_absenteeism'] or 0), 2)
            })

        return Response(formatted_data, status=status.HTTP_200_OK)



# --- BIFURCATION STATS VIEW ---
class BifurcationStatsView(APIView):
    def get(self, request):
        # Year logic
        req_year = request.query_params.get('year')
        target_year = int(req_year) if req_year else timezone.now().year
        
        # Month logic (Optional: if you want stats for a specific month)
        req_month = request.query_params.get('month')
        
        queryset = AdvanceManpowerDashboard.objects.filter(year=target_year)
        
        if req_month:
            # Convert month name (e.g., "January") to number if needed, 
            # but let's assume frontend sends month number or handles filtering.
            # For now, let's stick to Yearly Aggregation to match other charts, 
            # OR filter by specific month if provided.
            try:
                # If month is a name like "November", map it
                from calendar import month_name
                m_map = {name: i for i, name in enumerate(month_name) if name}
                if req_month in m_map:
                    queryset = queryset.filter(month=m_map[req_month])
            except:
                pass

        # Use Helper
        queryset = apply_hierarchy_filters(request, queryset)

        # Aggregate Sums
        data = queryset.aggregate(
            l1_req=Sum('l1_required'),
            l1_avail=Sum('l1_available'),
            l2_req=Sum('l2_required'),
            l2_avail=Sum('l2_available'),
            l3_req=Sum('l3_required'),
            l3_avail=Sum('l3_available'),
            l4_req=Sum('l4_required'),
            l4_avail=Sum('l4_available')
        )

        # Return as a single object (not a list)
        response_data = {
            'l1_required': data['l1_req'] or 0,
            'l1_available': data['l1_avail'] or 0,
            'l2_required': data['l2_req'] or 0,
            'l2_available': data['l2_avail'] or 0,
            'l3_required': data['l3_req'] or 0,
            'l3_available': data['l3_avail'] or 0,
            'l4_required': data['l4_req'] or 0,
            'l4_available': data['l4_avail'] or 0,
        }

        return Response(response_data, status=status.HTTP_200_OK)



class AdvanceCardStatsView(APIView):
    def get(self, request):
        req_year = request.query_params.get('year')
        target_year = int(req_year) if req_year else timezone.now().year
        
        queryset = AdvanceManpowerDashboard.objects.filter(year=target_year)
        queryset = apply_hierarchy_filters(request, queryset)

        # 1. Aggregate the raw DB fields
        data = queryset.aggregate(
            stations=Sum('total_stations'),
            req=Sum('operators_required'),
            avail=Sum('operators_available'),
            buf_req=Sum('buffer_manpower_required'),
            buf_avail=Sum('buffer_manpower_available'),
            
            # Raw DB Fields
            db_l1_req=Sum('l1_required'), 
            db_l1_avail=Sum('l1_available'),
            db_l2_req=Sum('l2_required'), 
            db_l2_avail=Sum('l2_available'),
            db_l3_req=Sum('l3_required'), 
            db_l3_avail=Sum('l3_available'),
            db_l4_req=Sum('l4_required'), 
            db_l4_avail=Sum('l4_available')
        )

        # 2. Map them to the keys your Frontend expects
        response_data = {
            # Main Card
            "total_stations": data['stations'] or 0,
            "operators_required": data['req'] or 0,
            "operators_available": data['avail'] or 0,
            "buffer_manpower_required": data['buf_req'] or 0,
            "buffer_manpower_available": data['buf_avail'] or 0,

            # MAPPING LOGIC:
            # Frontend Key           <--   Database Sum
            "bifurcation_plan_l1":        data['db_l1_req'] or 0,
            "bifurcation_actual_l1":      data['db_l1_avail'] or 0,
            
            "bifurcation_plan_l2":        data['db_l2_req'] or 0,
            "bifurcation_actual_l2":      data['db_l2_avail'] or 0,
            
            "bifurcation_plan_l3":        data['db_l3_req'] or 0,
            "bifurcation_actual_l3":      data['db_l3_avail'] or 0,
            
            "bifurcation_plan_l4":        data['db_l4_req'] or 0,
            "bifurcation_actual_l4":      data['db_l4_avail'] or 0,
        }

        # Return list (so frontend data[0] works)
        return Response([response_data], status=status.HTTP_200_OK)


# ============================== end ===================================================================




















# end =============================
# =============== Emp History Card ====================


from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from .models import (
    MasterTable,
    SkillMatrix,
    Score,
    MultiSkilling,
    RescheduledSession,
    UserRegistration,
    TrainingAttendance,
    Schedule,
    HanchouExamResult,
    ShokuchouExamResult,
)

from .serializers import (
    CardEmployeeMasterSerializer,
    OperatorCardSkillSerializer,
    CardScoreSerializer,
    CardMultiSkillingSerializer,
    CardHanchouExamResultSerializer,
    CardShokuchouExamResultSerializer,
    CardTrainingAttendanceSerializer,
    CardScheduleSerializer,
    CardRescheduledSessionSerializer,
)


class EmployeeCardDetailsView(APIView):
    def get(self, request):
        card_no = request.query_params.get('card_no')
        if not card_no:
            return Response({'error': 'card_no parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            employee = MasterTable.objects.get(emp_id=card_no)
        except MasterTable.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

        # === Employee Basic Info ===
        employee_data = CardEmployeeMasterSerializer(employee).data

        # === Skills & Scores ===
        operator_skills = OperatorCardSkillSerializer(SkillMatrix.objects.filter(employee=employee), many=True).data
        scores = CardScoreSerializer(Score.objects.filter(employee=employee), many=True).data
        multi_skilling = CardMultiSkillingSerializer(MultiSkilling.objects.filter(employee=employee), many=True).data

        # === Exam Results ===
        hanchou_results = CardHanchouExamResultSerializer(
            HanchouExamResult.objects.filter(employee=employee), many=True
        ).data
        shokuchou_results = CardShokuchouExamResultSerializer(
            ShokuchouExamResult.objects.filter(employee=employee), many=True
        ).data

        # === Scheduled Trainings ===
        all_schedules = Schedule.objects.filter(employees=employee)
        scheduled_trainings_data = CardScheduleSerializer(
            all_schedules, many=True, context={'employee': employee}
        ).data

        # === TRAINING ATTENDANCE (FIXED: Match by temp_id first) ===
        attendances_data = []
        try:
            # Priority 1: Match by temp_id (most accurate)
            if getattr(employee, 'temp_id', None):
                user_records = UserRegistration.objects.filter(temp_id__iexact=employee.temp_id.strip())
            else:
                # Fallback: match by name
                user_records = UserRegistration.objects.filter(
                    first_name__iexact=employee.first_name,
                    last_name__iexact=(employee.last_name or '').strip()
                )

            if user_records.exists():
                attendances = TrainingAttendance.objects.filter(user__in=user_records)
                attendances_data = CardTrainingAttendanceSerializer(attendances, many=True).data
                print(f"Found {len(attendances_data)} attendance records via temp_id/name match")
        except Exception as e:
            print(f"Error fetching attendance: {e}")

        # === RESCHEDULED SESSIONS (FIXED: Match by temp_id first) ===
        rescheduled_sessions_data = []
        try:
            # Same logic as attendance — match by temp_id first
            if getattr(employee, 'temp_id', None):
                user_records = UserRegistration.objects.filter(temp_id__iexact=employee.temp_id.strip())
            else:
                user_records = UserRegistration.objects.filter(
                    first_name__iexact=employee.first_name,
                    last_name__iexact=(employee.last_name or '').strip()
                )

            if user_records.exists():
                rescheduled_sessions = RescheduledSession.objects.filter(
                    employee__in=user_records
                ).select_related(
                    'employee', 'original_day', 'training_subtopic', 'batch'
                ).order_by('-rescheduled_date', '-rescheduled_time')

                rescheduled_sessions_data = CardRescheduledSessionSerializer(
                    rescheduled_sessions, many=True
                ).data

                print(f"Found {len(rescheduled_sessions_data)} rescheduled session(s) for {employee.first_name} (temp_id: {getattr(employee, 'temp_id', 'N/A')})")
            else:
                print(f"No UserRegistration found for temp_id: {getattr(employee, 'temp_id', 'N/A')} | Name: {employee.first_name} {employee.last_name}")

        except Exception as e:
            print(f"Error fetching rescheduled sessions: {e}")

        # === Final Response ===
        response_data = {
            'employee': employee_data,
            'operator_skills': operator_skills,
            'scores': scores,
            'multi_skilling': multi_skilling,
            'scheduled_trainings': scheduled_trainings_data,
            'hanchou_results': hanchou_results,
            'shokuchou_results': shokuchou_results,
            'attendance': attendances_data,
            'rescheduled_sessions': rescheduled_sessions_data,  # ← NOW WORKS 100%
        }

        # Debug print
        print("==== Employee Card Details ====")
        import pprint
        pprint.pprint(response_data)
        print("================================\n")

        return Response(response_data)


# =================== Emp history card end =============================


# =================== excel download master table =======================
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side
from datetime import datetime
from .models import MasterTable
from .serializers import MasterTableSerializer

class EmployeeExcelViewSet(viewsets.ModelViewSet):
    queryset = MasterTable.objects.all().select_related('department')
    serializer_class = MasterTableSerializer
    
    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        queryset = self.get_queryset()

        wb = Workbook()
        ws = wb.active
        ws.title = "EMPLOYEE MASTER"

        # Headers and titles
        ws.merge_cells('A1:I1')
        company_cell = ws['A1']
        company_cell.value = "Company Name: NL Technologies"
        company_cell.font = Font(bold=True, size=10)
        company_cell.alignment = Alignment(horizontal="center", vertical="center")

        ws.merge_cells('A2:I2')
        run_date_cell = ws['A2']
        run_date_cell.value = f"Run Date & Time: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        run_date_cell.font = Font(size=10)
        run_date_cell.alignment = Alignment(horizontal="center", vertical="center")

        ws.merge_cells('A4:I4')
        title_cell = ws['A4']
        title_cell.value = "EMPLOYEE MASTER"
        title_cell.font = Font(bold=True, size=12)
        title_cell.alignment = Alignment(horizontal="center", vertical="center")

        headers = [
            'Srl. No.',
            'Employee ID',
            'First Name',
            'Last Name',
            'Department',
            'Date of Joining',
            'Birth Date',
            'Sex',
            'Email',
            'Phone',
        ]
        header_font = Font(bold=True, size=10)
        header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        thin_border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=6, column=col_num, value=header)
            cell.font = header_font
            cell.alignment = header_alignment
            cell.border = thin_border
            
        ws.row_dimensions[6].height = 30
        
        for row_num, employee in enumerate(queryset, 7):
            birth_date = employee.birth_date.strftime('%d/%m/%Y') if employee.birth_date else ''
            joining_date = employee.date_of_joining.strftime('%d/%m/%Y') if employee.date_of_joining else ''
            department_name = employee.department.department_name if employee.department else 'N/A'

            row_data = [
                row_num - 6,  # Serial number starting from 1
                employee.emp_id,
                employee.first_name,
                employee.last_name,
                department_name,
                joining_date,
                birth_date,
                employee.get_sex_display(),
                employee.email,
                employee.phone,
            ]

            for col_num, value in enumerate(row_data, 1):
                cell = ws.cell(row=row_num, column=col_num, value=value)
                cell.border = thin_border
                cell.alignment = Alignment(horizontal="center" if col_num in [1, 2, 7, 8] else "left", vertical="center")
                cell.font = Font(size=9)
        
        # Set column widths
        column_widths = {
            'A': 6, 'B': 15, 'C': 15, 'D': 15, 'E': 20, 'F': 15, 'G': 12, 'H': 6, 'I': 25, 'J': 15,
        }
        
        for col_letter, width in column_widths.items():
            ws.column_dimensions[col_letter].width = width

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        filename = f'EMPLOYEE_MASTER_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        wb.save(response)
        
        return response
    
# ==================== MultiSkilling Start ======================== #
    
class EmployeeSkillSearch(APIView):
    """
    Search employee by emp_id or name and return their current skills.
    Only returns employees who have at least one skill in SkillMatrix.
    """
    def get(self, request):
        query = request.GET.get("query", "").strip()
        if not query:
            return Response({"error": "query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find all employees who match the search criteria
        employees_query = MasterTable.objects.filter(
            Q(emp_id__icontains=query) | 
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query)
        )
        
        # Get employees who have any skill matrix entries
        skilled_employee_ids = SkillMatrix.objects.filter(
            employee__in=employees_query
        ).values_list('employee__emp_id', flat=True).distinct()  
        
        employees_with_skills = employees_query.filter(emp_id__in=skilled_employee_ids) 
        
        result = []
        for emp in employees_with_skills:
            # Get all skills for this employee
            skills = SkillMatrix.objects.filter(employee=emp).select_related(
                "hierarchy__station", 
                "hierarchy__department", 
                "level"
            )
            
            skills_data = []
            for s in skills:
                skills_data.append({
                    "skill_id": s.id,
                    "station": s.hierarchy.station.station_name if s.hierarchy and s.hierarchy.station else None,
                    "department": s.hierarchy.department.department_name if s.hierarchy and s.hierarchy.department else None,
                    "level": s.level.level_name,
                    "updated_at": s.updated_at,
                })
            
            result.append({
                "emp_id": emp.emp_id,
                "first_name": emp.first_name,
                "last_name": emp.last_name,
                "department": emp.department.department_name if emp.department else None,
                "date_of_joining": emp.date_of_joining,
                "skills": skills_data,
            })
        
        return Response(result, status=status.HTTP_200_OK)

from .serializers import MultiSkillingSerializer


class MultiSkillingViewSet(viewsets.ModelViewSet):
    queryset = MultiSkilling.objects.all().select_related( 
       "employee",
       "department",
       "station",
       "skill_level"
    )
    serializer_class = MultiSkillingSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        emp_id = self.request.query_params.get("emp_id")
        if emp_id:
            qs = qs.filter(employee__emp_id=emp_id)
        return qs
    
    
    @action(detail=False, methods=["get"])
    def monthly_plan(self, request):
        """Return scheduled & in-progress items for monthly plan display"""
        qs = self.get_queryset().filter(status__in=["scheduled", "in-progress"])
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)




from .models import Machine,MachineAllocation
from .serializers import MachineSerializer,MachineAllocationSerializer

class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all().order_by("id")
    serializer_class = MachineSerializer
    @action(detail=False, methods=['get'])
    def by_department(self, request):
        """Get machines filtered by department"""
        department_id = request.query_params.get('department_id')
        if department_id:
            machines = self.queryset.filter(department_id=department_id)
            serializer = self.get_serializer(machines, many=True)
            return Response(serializer.data)
        return Response({"error": "department_id parameter required"}, 
                       status=status.HTTP_400_BAD_REQUEST)

class MachineAllocationViewSet(viewsets.ModelViewSet):
    queryset = MachineAllocation.objects.all().order_by("-allocated_at")
    serializer_class = MachineAllocationSerializer
    @action(detail=False, methods=['get'])
    def eligible_employees(self, request):
        """Get employees eligible for a specific machine based on level"""
        machine_id = request.query_params.get('machine_id')
        department_id = request.query_params.get('department_id')
        
        if not machine_id:
            return Response({"error": "machine_id parameter required"},
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            machine = Machine.objects.get(id=machine_id)
        except Machine.DoesNotExist:
            return Response({"error": "Machine not found"},
                          status=status.HTTP_404_NOT_FOUND)
        
        # Get SkillMatrix entries for employees in the target department
        # Filter by hierarchy department if department_id is provided
        target_department = department_id or machine.department.id
        
        # Get already allocated employees for this machine
        allocated_employees = MachineAllocation.objects.filter(
            machine=machine
        ).values_list('employee_id', flat=True)
        
        # Get eligible employees from SkillMatrix
        eligible_employees_queryset = SkillMatrix.objects.filter(
            hierarchy__department_id=target_department
        ).exclude(id__in=allocated_employees)
        
        # If you want to filter by specific hierarchy/station, add this:
        # .filter(hierarchy__station=machine.process)  # if machine.process links to station
        
        serializer = EligibleEmployeeSerializer(
            eligible_employees_queryset,
            many=True,
            context={'machine_level': machine.level}
        )
        
        return Response({
            'machine_level': machine.level,
            'employees': serializer.data
        })

    @action(detail=False, methods=['post'])
    def update_pending_status(self, request):
        """Manually trigger update of pending allocations"""
        MachineAllocation.update_pending_allocations()
        return Response({"message": "Pending allocations updated successfully"})

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get allocations filtered by approval status"""
        status_filter = request.query_params.get('status')
        if status_filter:
            allocations = self.queryset.filter(approval_status=status_filter)
            serializer = self.get_serializer(allocations, many=True)
            return Response(serializer.data)
        return Response({"error": "status parameter required"}, 
                status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        """Override to add any additional logic during update"""
        allocation = serializer.save()
        
        # Log the allocation update if needed
        print(f"Updated allocation: {allocation}")
        
        return allocation
    def perform_create(self, serializer):
        """Override to add any additional logic during creation"""
        # Ensure we're working with SkillMatrix instance
        employee_id = self.request.data.get('employee')
        try:
            skill_matrix_employee = SkillMatrix.objects.get(id=employee_id)
        except SkillMatrix.DoesNotExist:
            raise ValidationError("Employee not found in skill matrix")
        
        allocation = serializer.save(employee=skill_matrix_employee)
        print(f"Created allocation: {allocation}")
        return allocation




class MachineAllocationApprovalViewSet(viewsets.ModelViewSet):
    queryset = MachineAllocation.objects.all()
    serializer_class = MachineAllocationApprovalSerializer

    @action(detail=True, methods=['put'], url_path='set-status')
    def set_status(self, request, pk=None):
        allocation = self.get_object()
        status_value = request.data.get('approval_status')

        if status_value not in dict(MachineAllocation.APPROVAL_STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        allocation.approval_status = status_value
        allocation.save()
        return Response({
            'status': 'success',
            'id': allocation.id,
            'approval_status': allocation.approval_status
        })

    @action(detail=True, methods=['put'], url_path='reject')
    def reject(self, request, pk=None):
        allocation = self.get_object()
        allocation.approval_status = 'rejected'
        allocation.save()
        return Response({
            'status': 'rejected',
            'id': allocation.id,
            'approval_status': allocation.approval_status
        }, status=status.HTTP_200_OK)






# ============== history card pdf download ==============



from django.http import HttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime
import os
import json
import traceback

# Import the new models and serializers MultiSkilling
from .models import MasterTable, SkillMatrix, Score, Schedule, CompanyLogo
from .serializers import (
    CardEmployeeMasterSerializer,
    OperatorCardSkillSerializer,
    CardScoreSerializer,
    CardScheduleSerializer
)

@method_decorator(csrf_exempt, name='dispatch')
class EmployeeReportPDFView(View):
    def post(self, request, *args, **kwargs):
        """
        Handle PDF generation requests
        Accepts both form data and JSON input
        """
        try:
            print("\n=== Received PDF generation request ===")
            
            # 1. Parse input data
            card_no = self._get_card_number(request)
            if not card_no:
                return JsonResponse({'error': 'card_no is required'}, status=400)
            print(f"Processing card_no: {card_no}")

            # 2. Get employee record
            try:
                # Use the new MasterTable model
                employee = MasterTable.objects.get(emp_id=card_no)
                print(f"Found employee: {employee.first_name}")
            except MasterTable.DoesNotExist:
                print(f"Employee not found for card_no: {card_no}")
                return JsonResponse({'error': 'Employee not found'}, status=404)

            # 3. Fetch and serialize all data using the new serializers
            print("Fetching and serializing data...")
            employee_data = CardEmployeeMasterSerializer(employee).data
            
            operator_skills = OperatorCardSkillSerializer(
                SkillMatrix.objects.filter(employee=employee), many=True).data
                
            scores = CardScoreSerializer(
                Score.objects.filter(employee=employee), many=True).data

            multi_skilling = CardMultiSkillingSerializer(
                MultiSkilling.objects.filter(employee=employee), many=True).data

            hanchou_results = CardHanchouExamResultSerializer(
                HanchouExamResult.objects.filter(employee=employee), many=True).data
                
            shokuchou_results = CardShokuchouExamResultSerializer(
                ShokuchouExamResult.objects.filter(employee=employee), many=True).data
            
            scheduled_trainings = CardScheduleSerializer(
                Schedule.objects.filter(employees=employee), many=True).data

            # Attendance & Reschedules Logic (matching EmployeeCardDetailsView)
            attendances_data = []
            rescheduled_sessions_data = []
            
            user_records = UserRegistration.objects.none()
            if getattr(employee, 'temp_id', None):
                 user_records = UserRegistration.objects.filter(temp_id__iexact=employee.temp_id.strip())
            else:
                 user_records = UserRegistration.objects.filter(
                    first_name__iexact=employee.first_name,
                    last_name__iexact=(employee.last_name or '').strip()
                )
            
            if user_records.exists():
                attendances = TrainingAttendance.objects.filter(user__in=user_records).order_by('batch', 'day_number')
                attendances_data = CardTrainingAttendanceSerializer(attendances, many=True).data
                
                rescheduled_sessions = RescheduledSession.objects.filter(
                    employee__in=user_records
                ).select_related('employee', 'original_day', 'training_subtopic', 'batch').order_by('-rescheduled_date', '-rescheduled_time')
                rescheduled_sessions_data = CardRescheduledSessionSerializer(rescheduled_sessions, many=True).data

            
            # 4. Generate PDF content
            print("Generating PDF content...")
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer, 
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            story = self.create_pdf_content(
                employee_data,
                operator_skills,
                scores,
                multi_skilling,
                hanchou_results,
                shokuchou_results,
                scheduled_trainings,
                attendances_data,
                rescheduled_sessions_data
            )
            
            # 5. Build PDF document
            print("Building PDF document...")
            doc.build(story)
            buffer.seek(0)
            print("PDF generation completed successfully")

            # 6. Return PDF response
            response = HttpResponse(
                buffer.getvalue(), 
                content_type='application/pdf'
            )
            response['Content-Disposition'] = (
                f'attachment; filename="employee_report_{card_no}.pdf"'
            )
            return response
            
        except Exception as e:
            print("\n!!! PDF generation failed !!!")
            traceback.print_exc()
            return JsonResponse(
                {
                    'error': 'Internal server error',
                    'detail': str(e),
                    'traceback': traceback.format_exc()
                }, 
                status=500
            )

    def _get_card_number(self, request):
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                return data.get('card_no')
            except json.JSONDecodeError:
                return None
        return request.POST.get('card_no')

    def _format_date(self, date_obj):
        if isinstance(date_obj, str):
            try:
                date_obj = datetime.strptime(date_obj, '%Y-%m-%d').date()
            except ValueError:
                return 'N/A'
        return date_obj.strftime('%d-%b-%Y') if date_obj else 'N/A'

    def _get_company_logo(self):
        try:
            logo = CompanyLogo.objects.first()
            if logo and logo.logo:
                return logo.logo.path
        except Exception as e:
            print(f"Error getting company logo: {e}")
        return None

    def _add_header(self, story, styles):
        # """Add header with company logo and title"""
        logo_path = self._get_company_logo()
        
        if logo_path and os.path.exists(logo_path):
            try:
                logo = Image(logo_path, width=1*inch, height=0.7*inch)
                title = Paragraph("Employee Comprehensive Report", styles['Title'])
                header_data = [[title, logo]]
                header_table = Table(header_data, colWidths=[5.5*inch, 1*inch])
                header_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                    ('GRID', (0, 0), (-1, -1), 0, colors.white),
                ]))
                story.append(header_table)
            except Exception as e:
                print(f"Error adding logo: {e}")
                story.append(Paragraph("Employee Comprehensive Report", styles['Title']))
        else:
            story.append(Paragraph("Employee Comprehensive Report", styles['Title']))
        
        story.append(Spacer(1, 20))
    
    def _get_table_style(self):
        return TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4682B4')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,0), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('TOPPADDING', (0,0), (-1,0), 8),
            ('ALIGN', (0,1), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,1), (-1,-1), 9),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#E0E0E0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8F8F8')]),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ])

    def _get_result_badge_style(self, result, row):
        color = colors.green if result else colors.red
        return [
            ('TEXTCOLOR', (3, row), (3, row), color),
            ('FONTNAME', (3, row), (3, row), 'Helvetica-Bold')
        ]

    def _get_status_badge_style(self, status, row):
        status_colors = {
            'active': colors.green,
            'completed': colors.blue,
            'inprogress': colors.orange,
            'scheduled': colors.purple,
            'inactive': colors.gray,
            'rescheduled': colors.darkblue,
        }
        color = status_colors.get(status.lower(), colors.black)
        return [
            ('TEXTCOLOR', (1, row), (1, row), color),
            ('FONTNAME', (1, row), (1, row), 'Helvetica-Bold')
        ]

    # New `create_pdf_content` with serialized data as arguments
    # def create_pdf_content(self, employee_data, skills_data, scores_data, multi_skilling_queryset, training_data):
    def create_pdf_content(self, employee_data, skills_data, scores_data, multi_skilling, hanchou_results, shokuchou_results, scheduled_trainings, attendances, rescheduled_sessions):
        styles = getSampleStyleSheet()
        story = []
        
        # Add header
        self._add_header(story, styles)
        
        # Add sections using the pre-serialized data
        self._add_basic_info(story, styles, employee_data)
        self._add_operator_skills(story, styles, skills_data)
        self._add_scores(story, styles, scores_data)
        self._add_multi_skills(story, styles, multi_skilling)
        self._add_exam_results(story, styles, hanchou_results, "Hanchou Exam Results")
        self._add_exam_results(story, styles, shokuchou_results, "Shokuchou Exam Results")
        self._add_attendance(story, styles, attendances)
        self._add_reschedules(story, styles, rescheduled_sessions)
        
        return story

    def _add_basic_info(self, story, styles, employee_data):
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#4682B4'),
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph("Basic Information", heading_style))
        story.append(Spacer(1, 8))
        
        basic_data = [
            ["Field", "Value"],
            ["Name", f"{employee_data.get('first_name', 'N/A')} {employee_data.get('last_name', '')}"],
            ["Card No", employee_data.get('emp_id', 'N/A')],
            ["Department", employee_data.get('department', 'N/A')],
            ["Joining Date", self._format_date(employee_data.get('date_of_joining'))],
            ["Birth Date", self._format_date(employee_data.get('birth_date'))],
            ["Sex", employee_data.get('sex', 'N/A')],
            ["Email", employee_data.get('email', 'N/A')],
            ["Phone", employee_data.get('phone', 'N/A')],
        ]
        
        basic_table = Table(basic_data, colWidths=[2*inch, 4.5*inch])
        basic_table.setStyle(self._get_table_style())
        story.append(basic_table)
        story.append(Spacer(1, 24))

    def _add_operator_skills(self, story, styles, skills_data):
        if not skills_data:
            return

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#4682B4'),
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph("Operator Skills", heading_style))
        story.append(Spacer(1, 8))

        skill_data = [["Level", "Station", "Date"]]
        for skill in skills_data:
            skill_data.append([
                skill.get('level_name', 'N/A'),
                skill.get('station_name', 'N/A'),
                self._format_date(skill.get('updated_at'))
            ])

        skills_table = Table(skill_data, colWidths=[1*inch, 3.5*inch, 2*inch])
        skills_style = self._get_table_style()
        skills_style.add('ALIGN', (0,1), (0,-1), 'CENTER')
        skills_style.add('ALIGN', (2,1), (2,-1), 'CENTER')
        skills_table.setStyle(skills_style)
        story.append(skills_table)
        story.append(Spacer(1, 24))

    def _add_scores(self, story, styles, scores_data):
        if not scores_data:
            return
            
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#4682B4'),
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph("Scores and Assessments", heading_style))
        story.append(Spacer(1, 8))
        
        score_data = [["Test", "Marks", "Percentage", "Result", "Date"]]
        for score in scores_data:
            score_data.append([
                score.get('test_name', 'N/A'),
                str(score.get('marks', 'N/A')),
                f"{score.get('percentage', 'N/A')}%" if score.get('percentage') is not None else "N/A",
                "Pass" if score.get('passed') else "Fail",
                self._format_date(score.get('created_at'))
            ])
        
        scores_table = Table(score_data, colWidths=[2.5*inch, 0.8*inch, 1*inch, 0.8*inch, 1.4*inch])
        scores_style = self._get_table_style()
        scores_style.add('ALIGN', (1,1), (2,-1), 'CENTER')
        scores_style.add('ALIGN', (3,1), (3,-1), 'CENTER')
        scores_style.add('ALIGN', (4,1), (4,-1), 'CENTER')
        
        for row in range(1, len(score_data)):
            result = scores_data[row-1].get('passed')
            for style_command in self._get_result_badge_style(result, row):
                scores_style.add(*style_command)
        
        scores_table.setStyle(scores_style)
        story.append(scores_table)
        story.append(Spacer(1, 24))

    # def _add_multi_skills(self, story, styles, multi_skilling_queryset):
    #     # NOTE: This section assumes a MultiSkilling serializer exists or data is
    #     # fetched directly from the queryset like the original code. 
    #     # You'll need to define a serializer for this to match the new approach.
    #     if not multi_skilling_queryset.exists():
    #         return
            
    #     heading_style = ParagraphStyle(
    #         'CustomHeading',
    #         parent=styles['Heading2'],
    #         fontSize=14,
    #         spaceAfter=12,
    #         textColor=colors.HexColor('#4682B4'),
    #         fontName='Helvetica-Bold'
    #     )
    #     story.append(Paragraph("Multi-Skilling", heading_style))
    #     story.append(Spacer(1, 8))
        
    #     multi_data = [["Skill", "Status", "Department", "Level", "Date"]]
    #     for skill in multi_skilling_queryset:
    #         multi_data.append([
    #             str(skill.operation.name if skill.operation else skill.skill_level or "N/A"),
    #             skill.status.capitalize() if skill.status else "N/A",
    #             str(skill.department.department) if skill.department and hasattr(skill.department, 'department') else "N/A",
    #             skill.skill_level or "N/A",
    #             self._format_date(skill.date),
    #         ])
        
    #     multi_table = Table(multi_data, colWidths=[2.5*inch, 0.8*inch, 1.5*inch, 0.8*inch, 0.9*inch])
    #     multi_style = self._get_table_style()
    #     multi_style.add('ALIGN', (1,1), (1,-1), 'CENTER')
    #     multi_style.add('ALIGN', (3,1), (3,-1), 'CENTER')
    #     multi_style.add('ALIGN', (4,1), (4,-1), 'CENTER')
        
    #     for row in range(1, len(multi_data)):
    #         status = multi_skilling_queryset[row-1].status
    #         for style_command in self._get_status_badge_style(status, row):
    #             multi_style.add(*style_command)
        
    #     multi_table.setStyle(multi_style)
    #     story.append(multi_table)
    #     story.append(Spacer(1, 24))

    # def _add_refreshment_training(self, story, styles, training_data):
    #     if not training_data:
    #         return

    #     heading_style = ParagraphStyle(
    #         'CustomHeading',
    #         parent=styles['Heading2'],
    #         fontSize=14,
    #         spaceAfter=12,
    #         textColor=colors.HexColor('#4682B4'),
    #         fontName='Helvetica-Bold'
    #     )
    #     story.append(Paragraph("Refreshment Training", heading_style))
    #     story.append(Spacer(1, 8))

    #     training_table_data = [["Training Topic", "Venue", "Category", "Date", "Status"]]
    #     for training in training_data:
    #         training_table_data.append([
    #             training.get('topic', 'N/A'),
    #             training.get('venue_name', 'N/A'),
    #             training.get('category_name', 'N/A'),
    #             self._format_date(training.get('date')),
    #             training.get('status', 'N/A').capitalize()
    #         ])

    #     training_table = Table(training_table_data, colWidths=[2.0*inch, 1*inch, 1.5*inch, 0.8*inch, 1.2*inch])
    #     training_style = self._get_table_style()
    #     training_style.add('ALIGN', (3,1), (3,-1), 'CENTER')
    #     training_style.add('ALIGN', (4,1), (4,-1), 'CENTER')
    #     training_table.setStyle(training_style)

    #     story.append(training_table)
    #     story.append(Spacer(1, 24))
    def _add_multi_skills(self, story, styles, multi_skilling_data):
        if not multi_skilling_data:
             return
            
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#4682B4'),
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph("Multi-Skilling", heading_style))
        story.append(Spacer(1, 8))
        
        multi_data = [["Skill", "Status", "Department", "Level", "Date"]]
        for skill in multi_skilling_data:
            multi_data.append([
                str(skill.get('operation_name') or skill.get('skill_level') or "N/A"),
                skill.get('status', 'N/A').capitalize(),
                str(skill.get('department_name', 'N/A')),
                skill.get('skill_level', 'N/A'),
                self._format_date(skill.get('date')),
            ])
        
        multi_table = Table(multi_data, colWidths=[2.5*inch, 0.8*inch, 1.5*inch, 0.8*inch, 0.9*inch])
        multi_style = self._get_table_style()
        multi_style.add('ALIGN', (1,1), (1,-1), 'CENTER')
        multi_style.add('ALIGN', (3,1), (3,-1), 'CENTER')
        multi_style.add('ALIGN', (4,1), (4,-1), 'CENTER')
        
        multi_table.setStyle(multi_style)
        story.append(multi_table)
        story.append(Spacer(1, 24))

    def _add_exam_results(self, story, styles, results_data, title):
        if not results_data:
            return

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#4682B4'),
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph(title, heading_style))
        story.append(Spacer(1, 8))
        
        # Adjust columns based on what's available in Hanchou/Shokuchou serializers
        # Usually Exam Name, Marks, Result, Date
        exam_data = [["Exam Name", "Marks", "Result", "Attempt Date"]]
        for res in results_data:
            exam_data.append([
                res.get('exam_name', 'N/A') if 'exam_name' in res else res.get('sho_exam_name', 'N/A'),
                str(res.get('marks_obtained', 'N/A')),
                res.get('result', 'N/A'),
                self._format_date(res.get('attempt_date')),
            ])
            
        exam_table = Table(exam_data, colWidths=[3*inch, 1*inch, 1*inch, 1.5*inch])
        exam_style = self._get_table_style()
        exam_table.setStyle(exam_style)
        story.append(exam_table)
        story.append(Spacer(1, 24))

    def _add_attendance(self, story, styles, attendance_data):
        if not attendance_data:
            return
            
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#4682B4'),
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph("Training Attendance", heading_style))
        story.append(Spacer(1, 8))
        
        att_data = [["Day", "Status", "Date", "Batch"]]
        for att in attendance_data:
            att_data.append([
                f"Day {att.get('day_number', 'N/A')}",
                att.get('status', 'N/A').capitalize(),
                self._format_date(att.get('date')),
                att.get('batch', 'N/A')
            ])
            
        att_table = Table(att_data, colWidths=[1.5*inch, 1.5*inch, 2*inch, 1.5*inch])
        att_style = self._get_table_style()
        att_table.setStyle(att_style)
        story.append(att_table)
        story.append(Spacer(1, 24))

    def _add_reschedules(self, story, styles, reschedule_data):
        if not reschedule_data:
            return
            
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#4682B4'),
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph("Rescheduled Sessions", heading_style))
        story.append(Spacer(1, 8))
        
        res_data = [["Original Day", "Rescheduled To", "Time", "Reason", "Status"]]
        for res in reschedule_data:
            res_data.append([
                res.get('original_day', {}).get('day_number', 'N/A') if isinstance(res.get('original_day'), dict) else str(res.get('original_day', 'N/A')),
                self._format_date(res.get('rescheduled_date')),
                res.get('rescheduled_time', 'N/A'),
                res.get('reason', 'N/A'),
                res.get('status', 'N/A').capitalize()
            ])
            
        res_table = Table(res_data, colWidths=[1*inch, 1.2*inch, 1*inch, 2*inch, 1*inch])
        res_style = self._get_table_style()
        res_table.setStyle(res_style)
        story.append(res_table)
        story.append(Spacer(1, 24))

# ======================== Employee History PDF Download End ==========================

from rest_framework import viewsets
from .models import SkillMatrixFeatureFlag
from .serializers import FeatureFlagSerializer

class FeatureFlagViewSet(viewsets.ModelViewSet):
    queryset = SkillMatrixFeatureFlag.objects.all()
    serializer_class = FeatureFlagSerializer


# =================== Station Manager =================================

# from rest_framework import viewsets, status
# from rest_framework.response import Response
# from django.db import transaction
# from .models import StationManager  # Import from models.py
# from .serializers import StationManagerSerializer  # or SimpleStationManagerSerializer
# import logging

# logger = logging.getLogger(__name__)

# class StationManagerViewSet(viewsets.ModelViewSet):
#     queryset = StationManager.objects.all()
#     serializer_class = StationManagerSerializer  # Use debug serializer first

#     def create(self, request, *args, **kwargs):
#         """Override create to add better error handling and logging"""
#         logger.info(f"StationManager create request data: {request.data}")
#         print(f"DEBUG: Received data: {request.data}")
        
#         # Debug: Check what HierarchyStructure objects exist
#         print("DEBUG: Checking HierarchyStructure objects...")
#         try:
#             all_hierarchy = HierarchyStructure.objects.all()
#             for h in all_hierarchy[:10]:  # Show first 10
#                 print(f"  - ID: {h.pk}, Name: {getattr(h, 'structure_name', 'No name')}")
#         except Exception as e:
#             print(f"DEBUG: Error checking HierarchyStructure: {e}")
        
#         try:
#             serializer = self.get_serializer(data=request.data)
#             if serializer.is_valid():
#                 with transaction.atomic():
#                     self.perform_create(serializer)
#                 headers = self.get_success_headers(serializer.data)
#                 logger.info(f"StationManager created successfully: {serializer.data}")
#                 return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
#             else:
#                 logger.error(f"StationManager validation errors: {serializer.errors}")
#                 print(f"DEBUG: Validation errors: {serializer.errors}")
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"StationManager creation error: {str(e)}")
#             print(f"DEBUG: Exception: {str(e)}")
#             return Response(
#                 {"detail": f"An error occurred: {str(e)}"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def perform_create(self, serializer):
#         serializer.save()



from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import StationManager
from .serializers import StationManagerSerializer
import logging

logger = logging.getLogger(__name__)

class StationManagerViewSet(viewsets.ModelViewSet):
    queryset = StationManager.objects.all()
    serializer_class = StationManagerSerializer

    def create(self, request, *args, **kwargs):
        # Standard create override to catch errors gracefully
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating StationManager: {e}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        # Standard update override for debugging
        logger.info(f"Updating StationManager {kwargs.get('pk')} with data: {request.data}")
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating StationManager: {e}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )





# views.py# views.py# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StationManager, HierarchyStructure
from .serializers import StationManagerSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
def get_station_requirements(request):
    """Get minimum skill requirements for all stations"""
    try:
        logger.debug("Entering get_station_requirements view")
        # Ensure pre-fetching related data for performance
        requirements = StationManager.objects.all().select_related('department', 'station')

        data = []
        level_mapping = {
            'Beginner': 1,
            'Intermediate': 2,
            'Advanced': 3,
            'Expert': 4
        }

        for req in requirements:
            logger.debug(f"Processing StationManager ID: {req.id}")

            # 1. Skip records with no HierarchyStructure link
            if not req.station:
                logger.warning(f"Skipping StationManager ID {req.id} due to missing station FK")
                continue

            # 🛑 CRITICAL FIX: Get the PK of the actual Station Model 🛑
            # req.station is the HierarchyStructure object.
            # req.station.station is the linked Station model object.
            # We need the PK of the actual Station, not the HierarchyStructure.
            current_station_pk = req.station.station.pk if req.station.station else None
            
            if not current_station_pk:
                logger.warning(f"StationManager ID {req.id} lacks link to actual Station model, skipping.")
                continue

            # Use serializer to get display names
            serializer = StationManagerSerializer(req)
            serialized_data = serializer.data
            logger.debug(f"Serialized data for StationManager ID {req.id}: {serialized_data}")

            # Calculate numerical level
            level_number = level_mapping.get(req.minimum_level_required, 0)
            logger.debug(f"Mapping level '{req.minimum_level_required}' to number {level_number}")


            data.append({
                'id': req.id,
                # Use the PK of the actual Station model (e.g., 1, 2, 3) for the frontend lookup
                'station_id': current_station_pk, 
                
                'station_name': serialized_data.get('station_name', 'Unknown Station'),
                
                # Use the PK of the Department model (req.department is the HierarchyStructure)
                'department_id': req.department.department.pk if req.department and req.department.department else None, 
                'department_name': serialized_data.get('department_name', 'Unknown Department'), 
                
                'minimum_operators': req.minimum_operators,
                'minimum_level_required': req.minimum_level_required,
                'minimum_level_number': level_number
            })

        logger.debug(f"Returning data: {data}")
        return Response(data)

    except Exception as e:
        logger.error(f"Error in get_station_requirements: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)



@api_view(['POST'])
def create_station_manager(request):
    """Create a new StationManager record"""
    try:
        logger.info(f"StationManager create request data: {request.data}")
        serializer = StationManagerSerializer(data=request.data)
        if serializer.is_valid():
            station_manager = serializer.save()
            logger.info(f"StationManager created successfully: {serializer.data}")
            return Response(serializer.data, status=201)
        logger.error(f"StationManager creation failed: {serializer.errors}")
        return Response(serializer.errors, status=400)
    except Exception as e:
        logger.error(f"Error in create_station_manager: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=500)


# ====================== Station Mnager End =========================================
from django.shortcuts import render

def dojo_app(request):
    return render (request,'index.html')




#---------------------evaluation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction

# Import all the necessary models from your models.py file
from .models import TestSession, QuestionPaper, Station, MasterTable, Level


class StartTestSessionView(APIView):
    def post(self, request):
        try:
            print("Incoming Request Data:", request.data)

            # --- 1. Get data from the request ---
            test_name = request.data.get("test_name")
            assignments = request.data.get("assignments", [])
            question_paper_id = request.data.get("question_paper_id")
            level_id = request.data.get("level")
            skill_id = request.data.get("skill")  # Station id

            # --- 2. Basic validation ---
            if not test_name or not assignments:
                response_data = {"error": "Test name and assignments are required."}
                print("Response:", response_data)
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            # --- 3. Fetch related objects ---
            question_paper = None
            if question_paper_id:
                question_paper = get_object_or_404(QuestionPaper, question_paper_id=question_paper_id)

            level_obj = None
            if level_id:
                level_obj = get_object_or_404(Level, level_id=level_id)

            skill_obj = None
            if skill_id:
                skill_obj = get_object_or_404(Station, station_id=skill_id)

            created_sessions = []
            updated_sessions = []

            # --- 4. Use transaction so all succeed or all rollback ---
            with transaction.atomic():
                for item in assignments:
                    key_id = item.get("key_id")
                    employee_id = item.get("employee_id")

                    if not key_id or not employee_id:
                        raise ValueError("key_id and employee_id are required in each assignment.")

                    employee = get_object_or_404(MasterTable, emp_id=employee_id)

                    # ✅ Use update_or_create to avoid UNIQUE constraint error
                    session, created = TestSession.objects.update_or_create(
                        key_id=key_id,
                        defaults={
                            "test_name": test_name,
                            "employee": employee,
                            "level": level_obj,
                            "skill": skill_obj,
                            "question_paper": question_paper,
                        }
                    )

                    if created:
                        created_sessions.append(key_id)
                    else:
                        updated_sessions.append(key_id)

            response_data = {
                "status": "ok",
                "message": "Test sessions processed successfully.",
                "created_sessions": created_sessions,
                "updated_sessions": updated_sessions,
            }
            print("Response:", response_data)
            return Response(response_data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            response_data = {"error": str(e)}
            print("Response:", response_data)
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            response_data = {"error": str(e)}
            print("Response:", response_data)
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import logging
import traceback
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import TestSession, Score

# logger = logging.getLogger(__name__)
# EvaluationPassingCriteria

from decimal import Decimal
import traceback
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


from .models import TestSession, Score, QuestionPaper, MasterTable, TraineeInfo, EvaluationPassingCriteria, Station
from .serializers import ScoreSerializer, SimpleScoreSerializer, TestSessionSerializer
from django.core.cache import cache
from decimal import Decimal
import traceback
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


import logging
import traceback
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import TestSession, Score

class ScoreListView(APIView):
    def get(self, request):
        # Assuming you use caching for latest test session
        session_key = cache.get("latest_test_session")
        if not session_key:
            return Response([])

        scores = Score.objects.filter(test__key_id=session_key).select_related('employee', 'level', 'skill')
        serializer = ScoreSerializer(scores, many=True)
        return Response(serializer.data)


class KeyIdToEmployeeNameMap(APIView):
    def get(self, request):
        mapping = TestSession.objects.select_related('employee').all()
        return Response({
            s.key_id: f"{s.employee.first_name} {s.employee.last_name}" 
            for s in mapping
        })


# class PastTestSessionsView(APIView):
#     def get(self, request):
#         # Get distinct test names from Score model through the test relationship
#         test_names = Score.objects.select_related('test').filter(
#             test__isnull=False
#         ).values_list('test__test_name', flat=True).distinct()
        
#         return Response(list(test_names))
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import TestSession
import logging

logger = logging.getLogger(__name__)

class PastTestSessionsView(APIView):
    def get(self, request):
        try:
            # Fetch distinct test sessions with test_name and created_at, sorted by created_at (descending)
            test_sessions = TestSession.objects.filter(
                test_name__isnull=False
            ).values('test_name', 'created_at').distinct().order_by('-created_at')
            
            # Format response with test_name and formatted date
            response_data = [
                {
                    'test_name': session['test_name'],
                    'created_at': session['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                }
                for session in test_sessions
            ]
            
            logger.info("Returning %d test sessions", len(response_data))
            return Response(response_data)
        except Exception as e:
            logger.error("Error in PastTestSessionsView: %s", str(e))
            return Response({'error': str(e)}, status=500)

import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Score
from .serializers import ScoreSerializer  # Import your serializer

class ScoresByTestView(APIView):
    def get(self, request, name):
        try:
            # Filter scores and pre-fetch related objects for efficiency
            scores = (
                Score.objects
                .filter(test__test_name=name)
                .select_related(
                    'employee', 'employee__department',
                    'department',
                    'skill', 'skill__subline', 'skill__subline__line', 'skill__subline__line__department',
                    'level', 'test', 'test__department'
                )
            )

            # Use the serializer to handle data, including get_department logic
            serializer = ScoreSerializer(scores, many=True)

            # Debug: Print the serialized data (this will trigger the serializer's prints for department sources)
            print("Final data being sent to frontend:", serializer.data)

            return Response(serializer.data)

        except Exception as e:
            print(f"Error in ScoresByTestView: {e}")
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SkillListView(APIView):
    def get(self, request):
        skills = Station.objects.values_list('station_name', flat=True).distinct()
        return Response(list(skills))


class ResultSummaryAPIView(APIView):
    def get(self, request):
        try:
            scores = Score.objects.select_related('employee', 'level', 'skill')
            data = []
            for score in scores:
                # Use the percentage from the score model instead of recalculating
                percentage = score.percentage
                result = 'Pass' if score.percentage >= 80 else 'Retraining' if score.percentage >= 50 else 'Fail'

                data.append({
                    "employee_id": score.employee.emp_id if hasattr(score.employee, 'emp_id') else score.employee.id,
                    "name": f"{score.employee.first_name} {score.employee.last_name}",
                    "marks": score.marks,
                    "percentage": percentage,
                    "section": score.employee.section if hasattr(score.employee, 'section') else '',
                    "level_name": score.level.level_name if score.level and hasattr(score.level, 'level_name') else '',
                    "skill": score.skill.station_name if score.skill and hasattr(score.skill, 'station_name') else (score.skill.skill if score.skill else ''),
                    "result": result,
                })

            serializer = SimpleScoreSerializer(data, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"Error in ResultSummaryAPIView: {e}")
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ResultSummaryAPIView(APIView):
    def get(self, request):
        scores = Score.objects.select_related('employee', 'level', 'skill')
        data = []
        for score in scores:
            percentage = round((score.marks / 10) * 100, 2)  # Adjust total marks accordingly
            result = 'Pass' if score.marks >= 8 else 'Retraining' if score.marks >= 5 else 'Fail'

            data.append({
                "employee_id": score.employee.id,
                "name": score.employee.name,
                "marks": score.marks,
                "percentage": percentage,
                "section": score.employee.section,  # assuming CharField
                "level_name": score.level.name if score.level else '',
                "skill": score.skill.skill if score.skill else '',  # Station.skill string
                "result": result,
            })

        serializer = SimpleScoreSerializer(data, many=True)
        return Response(serializer.data)
    


import logging
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import (
    QuestionPaper, Score, Station, TestSession, MasterTable, 
    Level, TemplateQuestion
)

# Configure logger
logger = logging.getLogger(__name__)

# class SubmitWebTestAPIView(APIView):
#     """
#     Submit test answers from web/tablet exam (without remote).
#     """
#     def post(self, request):
#         try:
#             logger.info("SubmitWebTestAPIView called with data: %s", request.data)

#             # Extract payload
#             employee_id = request.data.get("employee_id")
#             test_name = request.data.get("test_name")
#             question_paper_id = request.data.get("question_paper_id")
#             answers = request.data.get("answers", [])
#             skill_id = request.data.get("skill_id")
#             level_id = request.data.get("level_id")
            

#             # Validate required fields
#             if not employee_id or not test_name or not question_paper_id or not isinstance(answers, list):
#                 logger.warning("Validation failed: missing required fields.")
#                 return Response(
#                     {"error": "employee_id, test_name, question_paper_id, and answers[] are required."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Get employee
#             logger.debug("Fetching employee_id=%s", employee_id)
#             employee = get_object_or_404(MasterTable, emp_id=employee_id)

#             # Get question paper
#             logger.debug("Fetching question_paper_id=%s", question_paper_id)
#             question_paper = get_object_or_404(QuestionPaper, question_paper_id=question_paper_id)

#             # Handle skill (Station)
#             skill = None
#             if skill_id:
#                 try:
#                     skill_id_int = int(skill_id)
#                     logger.debug("Fetching skill by station_id=%s", skill_id_int)
#                     skill = get_object_or_404(Station, station_id=skill_id_int)
#                 except (ValueError, TypeError):
#                     logger.warning("Invalid skill_id: %s. Expected an integer.", skill_id)
#                     return Response(
#                         {"error": "skill_id must be a valid integer."},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )

#             # Handle level
#             level_obj = None
#             if level_id:
#                 try:
#                     level_id_int = int(level_id)
#                     logger.debug("Fetching level_id=%s", level_id_int)
#                     level_obj = get_object_or_404(Level, level_id=level_id_int)
#                     logger.info("Level fetched: %s", level_obj.level_name)
#                 except (ValueError, TypeError):
#                     logger.warning("Invalid level_id: %s. Expected an integer.", level_id)
#                     return Response(
#                         {"error": "level_id must be a valid integer."},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )

#             # Get all questions
#             questions = list(
#                 TemplateQuestion.objects
#                 .filter(question_paper=question_paper)
#                 .order_by("id")
#             )
#             total_questions = len(questions)
#             logger.info("Total questions found: %s", total_questions)

#             if total_questions == 0:
#                 logger.error("No questions found for paper id=%s", question_paper_id)
#                 return Response({"error": "No questions found for this paper."}, status=status.HTTP_400_BAD_REQUEST)

#             # Compare answers (frontend sends 0-3 or -1 for unanswered; correct_answer is text)
#             correct_count = 0
#             for i, submitted_ans in enumerate(answers):
#                 if i < total_questions:
#                     question = questions[i]
#                     logger.debug("Q%s: submitted=%s", i+1, submitted_ans)

#                     # Map submitted answer (0-3 or -1) to letter
#                     if isinstance(submitted_ans, int) and 0 <= submitted_ans <= 3:
#                         submitted_letter = chr(65 + submitted_ans)  # 0=A, 1=B, etc.
#                     else:
#                         submitted_letter = None  # Unanswered or invalid
#                         logger.debug("Q%s: skipped (unanswered or invalid)", i+1)

#                     # Compute correct letter
#                     options = [question.option_a, question.option_b, question.option_c, question.option_d]
#                     try:
#                         correct_idx = options.index(question.correct_answer)
#                         correct_letter = chr(65 + correct_idx)  # A=0, etc.
#                         if submitted_letter == correct_letter:
#                             correct_count += 1
#                             logger.debug("Q%s: correct (submitted=%s, correct=%s)", i+1, submitted_letter, correct_letter)
#                         else:
#                             logger.debug("Q%s: incorrect (submitted=%s, correct=%s)", i+1, submitted_letter, correct_letter)
#                     except ValueError:
#                         logger.warning("Q%s: correct_answer '%s' not in options %s", i+1, question.correct_answer, options)
#                         continue

#             percentage = round((correct_count / total_questions) * 100, 2) if total_questions > 0 else 0
#             passed = percentage >= 80 # Assuming 80% is the passing mark
#             logger.info("Scoring: %s/%s correct (%.2f%%), passed=%s",
#                         correct_count, total_questions, percentage, passed)

#             # Create or fetch TestSession
#             test_session, _ = TestSession.objects.get_or_create(
#                 test_name=test_name,
#                 key_id=f"{employee_id}-{question_paper_id}",
#                 employee=employee,
#                 defaults={
#                     "level": level_obj,
#                     "skill": skill,
#                     "question_paper": question_paper,
#                 }
#             )

#             # Save score linked to TestSession (FIX: Use test field, not test_name)
#             with transaction.atomic():
#                 score, created = Score.objects.get_or_create(
#                     employee=employee,
#                     test=test_session,  # Use test_session object
#                     defaults={
#                         'marks': correct_count,
#                         'percentage': percentage,
#                         'passed': passed,
#                         'skill': skill,
#                         'level': level_obj,
#                         'raw_answers': answers,
#                     }
#                 )

#                 if not created and correct_count > score.marks:
#                     logger.info("Updating existing score for employee=%s, test_session=%s", employee_id, test_session.id)
#                     score.marks = correct_count
#                     score.percentage = percentage
#                     score.passed = passed
#                     score.skill = skill
#                     score.level = level_obj
#                     score.raw_answers = answers
#                     score.save()

#             # Construct employee name
#             employee_full_name = f"{employee.first_name or ''} {employee.last_name or ''}".strip() or employee.emp_id

#             return Response({
#                 "employee": employee_full_name,
#                 "marks": correct_count,
#                 "total_questions": total_questions,
#                 "percentage": percentage,
#                 "passed": passed,
#                 "level_received": level_obj.level_name if level_obj else None,
#                 "message": "Score saved successfully"
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_trace = traceback.format_exc()
#             logger.error("Error in SubmitWebTestAPIView: %s\n%s", str(e), error_trace)
#             return Response({
#                 "error": str(e),
#                 "traceback": error_trace
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        



class SubmitWebTestAPIView(APIView):
    """
    Submit test answers from web/tablet exam (without remote).
    """
    def post(self, request):
        try:
            logger.info("SubmitWebTestAPIView called with data: %s", request.data)

            employee_id = request.data.get("employee_id")
            test_name = request.data.get("test_name")
            question_paper_id = request.data.get("question_paper_id")
            answers = request.data.get("answers", [])
            skill_id = request.data.get("skill_id")
            level_id = request.data.get("level_id")
            department_name = request.data.get("department_name")  # Added

            # Validate required fields
            if not all([employee_id, test_name, question_paper_id, level_id, department_name]) or not isinstance(answers, list):
                logger.warning("Validation failed: missing required fields.")
                return Response(
                    {"error": "employee_id, test_name, question_paper_id, level_id, department_name, and answers[] are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get employee, question paper, level, and department objects
            logger.debug("Fetching employee_id=%s", employee_id)
            employee = get_object_or_404(MasterTable, emp_id=employee_id)
            logger.debug("Fetching question_paper_id=%s", question_paper_id)
            question_paper = get_object_or_404(QuestionPaper, question_paper_id=question_paper_id)
            logger.debug("Fetching level_id=%s", level_id)
            level_object = get_object_or_404(Level, level_id=level_id)
            logger.debug("Fetching department_name=%s", department_name)
            department = get_object_or_404(Department, department_name=department_name)

            # Log department details for debugging
            logger.debug("Employee.department: %s", employee.department.department_name if employee.department else "None")
            logger.debug("QuestionPaper.department: %s", question_paper.department.department_name if question_paper.department else "None")
            logger.debug("Submitted department_name: %s", department_name)

            # Handle skill (station)
            skill_object = None
            if skill_id:
                logger.debug("Fetching skill (station) by id=%s", skill_id)
                skill_object = get_object_or_404(Station, station_id=skill_id)

            # Get all questions related to the question paper
            questions = list(question_paper.template_questions.all().order_by("id"))
            total_questions = len(questions)
            logger.info("Total questions found: %s", total_questions)

            if total_questions == 0:
                logger.error("No questions found for paper id=%s", question_paper_id)
                return Response({"error": "No questions found for this paper."}, status=status.HTTP_400_BAD_REQUEST)

            # Compare answers
            correct_count = 0
            for i, ans in enumerate(answers):
                if i < total_questions:
                    question = questions[i]
                    options = [question.option_a, question.option_b, question.option_c, question.option_d]
                    try:
                        correct_index = options.index(question.correct_answer)
                    except ValueError:
                        correct_index = -1
                    logger.debug("Q%s: submitted=%s, correct_index=%s", i+1, ans, correct_index)
                    if ans == correct_index:
                        correct_count += 1

            # Get Dynamic Passing Criteria
            required_percentage = Decimal('80.00')
            try:
                passing_criteria = EvaluationPassingCriteria.objects.filter(
                    level=question_paper.level,
                    department=question_paper.department
                ).first()
                if passing_criteria:
                    required_percentage = passing_criteria.percentage
            except Exception as e:
                logger.error("Error retrieving passing criteria: %s", e)

            # Calculate percentage
            if total_questions > 0:
                percentage_decimal = Decimal(correct_count) / Decimal(total_questions) * Decimal('100')
                percentage_decimal = percentage_decimal.quantize(Decimal('0.01'))
                percentage = float(percentage_decimal)
            else:
                percentage_decimal = Decimal('0.00')
                percentage = 0.0

            passed = percentage_decimal >= required_percentage
            logger.info("Scoring: %s/%s correct (%.2f%%), passed=%s",
                        correct_count, total_questions, percentage, passed)

            # ==== NEW RETRAINING/ATTEMPT LOGIC START ====
            from .models import RetrainingSession, RetrainingSessionDetail, RetrainingConfig, Score

            # Calculate the next attempt number for this employee/level/dept/skill
            prev_scores = Score.objects.filter(
                employee=employee,
                level=level_object,
                department=department,
                skill=skill_object
            ).order_by('-attempt_no')

            last_score = prev_scores.first()
            attempt_no = 1 if not last_score else last_score.attempt_no + 1

            # Get max_attempts from config (or use default)
            config = RetrainingConfig.objects.filter(evaluation_type='Evaluation').first()
            max_attempts = config.max_count if config else 2

            if attempt_no > max_attempts:
                return Response({'error': 'Maximum allowed attempts reached for this evaluation.'}, status=400)

            # If attempt_no > 1, require a scheduled retraining session + session detail for previous fail
            retraining = None
            retraining_detail_exists = False
            if attempt_no > 1:
                retraining = RetrainingSession.objects.filter(
                    employee=employee,
                    level=level_object,
                    department=department,
                    station=skill_object,
                    evaluation_type='Evaluation',
                    status='Scheduled',
                    attempt_no=attempt_no - 1
                ).order_by('-created_at').first()
                retraining_detail_exists = retraining and RetrainingSessionDetail.objects.filter(retraining_session=retraining).exists()
                if not (retraining and retraining_detail_exists):
                    return Response({'error': 'You must have a scheduled retraining session with details entered for your previous failed attempt before continuing.'}, status=400)
            # ==== NEW RETRAINING/ATTEMPT LOGIC END ====

            # Create or update TestSession and Score
            with transaction.atomic():
                test_session, _ = TestSession.objects.get_or_create(
                    employee=employee,
                    question_paper=question_paper,
                    key_id=f"web-{employee_id}-{question_paper_id}",
                    defaults={
                        "test_name": test_name,
                        "level": level_object,
                        "skill": skill_object,
                        "department": department,  # Store Forging
                    }
                )

                # ==== UPDATED: Always set attempt_no on Score ====
                score, created = Score.objects.get_or_create(
                    employee=employee,
                    test=test_session,
                    attempt_no=attempt_no,  # NEW: set attempt_no here
                    defaults={
                        'marks': correct_count,
                        'percentage': percentage,
                        'passed': passed,
                        'skill': skill_object,
                        'level': level_object,
                        'department': department,
                        'raw_answers': answers,  # Store Forging
                    }
                )

                if not created:
                    logger.info("Updating existing score for employee=%s", employee.emp_id)
                    score.marks = correct_count
                    score.percentage = percentage
                    score.passed = passed
                    score.skill = skill_object
                    score.level = level_object
                    score.department = department  # Update to Forging
                    score.raw_answers = answers
                    score.attempt_no = attempt_no  # NEW: Ensure updated
                    score.save()

                # ==== NEW: Mark retraining session as 'Completed' after new attempt ====
                if attempt_no > 1 and retraining and retraining.status == 'Scheduled':
                    retraining.status = 'Completed'
                    retraining.save(update_fields=['status'])
                # ==== END NEW ====

            logger.debug("Score.department: %s", score.department.department_name if score.department else "None")

            return Response({
                "employee": f"{employee.first_name} {employee.last_name}",
                "marks": correct_count,
                "total_questions": total_questions,
                "percentage": percentage,
                "passed": passed,
                "level_received": level_object.level_name,
                "department": department.department_name,  # Return Forging
                "attempt_no": attempt_no,  # NEW: return this for frontend/debug
                "message": "Score saved successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            error_trace = traceback.format_exc()
            logger.error("Error in SubmitWebTestAPIView: %s\n%s", str(e), error_trace)
            return Response({
                "error": str(e),
                "traceback": error_trace if settings.DEBUG else "An internal server error occurred."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from rest_framework import viewsets


class KeyEventCreateView(APIView):
    def post(self, request):
        serializer = KeyEventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Key event saved'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LatestKeyEventView(APIView):
    def get(self, request):
        try:
            latest_event = KeyEvent.objects.latest('timestamp')
            serializer = KeyEventSerializer(latest_event)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except KeyEvent.DoesNotExist:
            return Response({"message": "No key events yet."}, status=status.HTTP_404_NOT_FOUND)

        
# api/views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ConnectEventSerializer

@api_view(['POST'])
def connect_event_create(request):
    serializer = ConnectEventSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)




@api_view(['POST'])
def vote_event_create(request):
    serializer = VoteEventSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


from .models import EvaluationPassingCriteria, Level, Department
from .serializers import EvaluationPassingCriteriaSerializer, LevelSerializer, DepartmentSerializer

class EvaluationPassingCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationPassingCriteria.objects.select_related('level', 'department').all()
    serializer_class = EvaluationPassingCriteriaSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            # Check if criteria already exists for this level-department combination
            level_id = request.data.get('level')
            department_id = request.data.get('department')
            
            if not level_id or not department_id:
                return Response(
                    {'detail': 'Level and Department are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            existing = EvaluationPassingCriteria.objects.filter(
                level_id=level_id,
                department_id=department_id
            ).first()
            
            if existing:
                return Response(
                    {'detail': 'Passing criteria already exists for this Level and Department combination.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {'detail': 'Passing criteria already exists for this Level and Department combination.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Error creating criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            level_id = request.data.get('level')
            department_id = request.data.get('department')
            
            if not level_id or not department_id:
                return Response(
                    {'detail': 'Level and Department are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if another criteria exists for this level-department combination
            existing = EvaluationPassingCriteria.objects.filter(
                level_id=level_id,
                department_id=department_id
            ).exclude(id=instance.id).first()
            
            if existing:
                return Response(
                    {'detail': 'Another passing criteria already exists for this Level and Department combination.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().update(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {'detail': 'Another passing criteria already exists for this Level and Department combination.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Error updating criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'detail': f'Error deleting criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 
        






from .models import EvaluationPassingCriteria, Level, Department
from .serializers import EvaluationPassingCriteriaSerializer, LevelSerializer, DepartmentSerializer

class EvaluationPassingCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationPassingCriteria.objects.select_related('level', 'department').all()
    serializer_class = EvaluationPassingCriteriaSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            # Check if criteria already exists for this level-department combination
            level_id = request.data.get('level')
            department_id = request.data.get('department')
            
            if not level_id or not department_id:
                return Response(
                    {'detail': 'Level and Department are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            existing = EvaluationPassingCriteria.objects.filter(
                level_id=level_id,
                department_id=department_id
            ).first()
            
            if existing:
                return Response(
                    {'detail': 'Passing criteria already exists for this Level and Department combination.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {'detail': 'Passing criteria already exists for this Level and Department combination.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Error creating criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            level_id = request.data.get('level')
            department_id = request.data.get('department')
            
            if not level_id or not department_id:
                return Response(
                    {'detail': 'Level and Department are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if another criteria exists for this level-department combination
            existing = EvaluationPassingCriteria.objects.filter(
                level_id=level_id,
                department_id=department_id
            ).exclude(id=instance.id).first()
            
            if existing:
                return Response(
                    {'detail': 'Another passing criteria already exists for this Level and Department combination.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().update(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {'detail': 'Another passing criteria already exists for this Level and Department combination.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Error updating criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'detail': f'Error deleting criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 

from .models import EvaluationPassingCriteria, Level, Department
from .serializers import EvaluationPassingCriteriaSerializer, LevelSerializer, DepartmentSerializer

class EvaluationPassingCriteriaViewSet(viewsets.ModelViewSet):
    queryset = EvaluationPassingCriteria.objects.select_related('level', 'department').all()
    serializer_class = EvaluationPassingCriteriaSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            # Check if criteria already exists for this level-department combination
            level_id = request.data.get('level')
            department_id = request.data.get('department')
            
            if not level_id or not department_id:
                return Response(
                    {'detail': 'Level and Department are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            existing = EvaluationPassingCriteria.objects.filter(
                level_id=level_id,
                department_id=department_id
            ).first()
            
            if existing:
                return Response(
                    {'detail': 'Passing criteria already exists for this Level and Department combination.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {'detail': 'Passing criteria already exists for this Level and Department combination.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Error creating criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            level_id = request.data.get('level')
            department_id = request.data.get('department')
            
            if not level_id or not department_id:
                return Response(
                    {'detail': 'Level and Department are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if another criteria exists for this level-department combination
            existing = EvaluationPassingCriteria.objects.filter(
                level_id=level_id,
                department_id=department_id
            ).exclude(id=instance.id).first()
            
            if existing:
                return Response(
                    {'detail': 'Another passing criteria already exists for this Level and Department combination.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().update(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {'detail': 'Another passing criteria already exists for this Level and Department combination.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Error updating criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'detail': f'Error deleting criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 





import logging
import traceback
from datetime import datetime
import uuid
from collections import defaultdict
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import (
    QuestionPaper, Score, Station, TestSession, MasterTable, 
    Level, TemplateQuestion, Department
)

# Configure logger
logger = logging.getLogger(__name__)

class EndTestSessionView(APIView):
    """
    End remote/group test session and process answers for multiple remotes/key_ids.
    Expects payload: {"department_name": "DeptX", "paper_id": 1, "skill_id": 1, "level_id": 1, "test_name": "...", "answers": {"key_id1": [0,2,-1,3], ...}}
    Creates unique TestSession per submission with test_name based on time, level, department, station.
    If no template TestSession exists for key_id, creates one using provided metadata and employee lookup via MasterTable(emp_id=key_id).
    Append-only: Skip if Score exists for the unique test (no updates/edits).
    """
    def post(self, request):
        try:
            logger.info("📥 EndTestSessionView called with data: %s", request.data)
            submitted_data = request.data
            if not isinstance(submitted_data, dict):
                logger.warning("Invalid payload type: %s", type(submitted_data))
                return Response(
                    {"error": "Payload must be a dict containing 'department_name', 'paper_id', 'skill_id', 'level_id', 'test_name', and 'answers' {key_id: [answers]}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            department_name = submitted_data.get("department_name", "N/A")
            paper_id = submitted_data.get("paper_id")
            skill_id = submitted_data.get("skill_id")
            level_id = submitted_data.get("level_id")
            test_name = submitted_data.get("test_name", f"Remote Group Test {datetime.now().strftime('%Y-%m-%d')}")

            if not paper_id or not skill_id or not level_id:
                return Response(
                    {"error": "Missing required fields: paper_id, skill_id, level_id"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            answers_data = submitted_data.get("answers", {})
            if not isinstance(answers_data, dict):
                logger.warning("Invalid answers data type: %s", type(answers_data))
                return Response(
                    {"error": "Answers must be a dict of {key_id: [answers]}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            logger.info("🏢 Submitted Department: %s", department_name)
            logger.info("📄 Paper ID: %s, Skill ID: %s, Level ID: %s", paper_id, skill_id, level_id)
            logger.info("🔑 Submitted Key IDs: %s", list(answers_data.keys()))

            successful_results = []
            error_results = []
            for key_id, answers in answers_data.items():
                # 1. Receive and validate input for this key_id
                if not isinstance(answers, list):
                    logger.warning("Invalid answers format for key_id %s: %s", key_id, type(answers))
                    error_results.append({"key_id": key_id, "error": "Answers must be a list of integers (0-3 or -1)"})
                    continue

                # 2. For each submitted test (key_id) - Fetch or create the template TestSession object(s)
                sessions = TestSession.objects.filter(key_id=key_id)
                template_created = False
                if not sessions.exists():
                    logger.info("No template TestSession found for key_id: %s - creating one", key_id)
                    try:
                        # Lookup employee assuming emp_id matches key_id (adjust query if remote assignment differs)
                        employee = get_object_or_404(MasterTable, emp_id=key_id)
                        question_paper = get_object_or_404(QuestionPaper, id=paper_id)
                        skill = get_object_or_404(Station, id=skill_id)
                        level = get_object_or_404(Level, id=level_id)
                        department = get_object_or_404(Department, department_name=department_name)

                        # Create template session for this remote/key_id
                        template_session = TestSession.objects.create(
                            employee=employee,
                            question_paper=question_paper,
                            key_id=key_id,
                            test_name=f"Template session for remote {key_id} - {test_name}",
                            level=level,
                            skill=skill,
                            department=department,
                        )
                        sessions = TestSession.objects.filter(id=template_session.id)
                        template_created = True
                        logger.info("Created template TestSession %s for key_id %s (employee %s)", template_session.id, key_id, employee.emp_id)
                    except Exception as create_err:
                        logger.error("Failed to create template session for key_id %s: %s", key_id, create_err)
                        error_results.append({"key_id": key_id, "error": f"Failed to create template session: {str(create_err)}"})
                        continue

                for session in sessions:
                    # 3. Validate session integrity
                    if not session.question_paper:
                        logger.warning("No QuestionPaper assigned for session %s (key_id: %s)", session.id, key_id)
                        error_results.append({"session_id": session.id, "key_id": key_id, "error": "No QuestionPaper assigned"})
                        continue
                    if not session.employee:
                        logger.warning("No employee assigned for session %s (key_id: %s)", session.id, key_id)
                        error_results.append({"session_id": session.id, "key_id": key_id, "error": "No employee assigned"})
                        continue

                    # Resolve department for Score creation (read-only for session)
                    score_department = None
                    resolved_dept_name = "N/A"
                    if department_name != "N/A":
                        try:
                            score_department = get_object_or_404(Department, department_name=department_name)
                            resolved_dept_name = department_name
                        except Exception:
                            score_department = session.employee.department
                            if score_department:
                                resolved_dept_name = score_department.department_name
                            else:
                                error_results.append({"session_id": session.id, "key_id": key_id, "error": "No department assigned"})
                                continue
                    else:
                        score_department = session.employee.department
                        if not score_department:
                            error_results.append({"session_id": session.id, "key_id": key_id, "error": "No department assigned to employee"})
                            continue
                        resolved_dept_name = score_department.department_name

                    # 4. Get questions and check count
                    questions = list(session.question_paper.template_questions.order_by("id"))
                    total_questions = len(questions)
                    if total_questions == 0:
                        logger.error("No questions in QuestionPaper %s for session %s (key_id: %s)", 
                                     session.question_paper.id, session.id, key_id)
                        error_results.append({"session_id": session.id, "key_id": key_id, "error": "No questions in QuestionPaper"})
                        continue

                    if len(answers) != total_questions:
                        logger.warning("Answer mismatch for key_id %s: %d answers vs %d questions", 
                                       key_id, len(answers), total_questions)
                        error_results.append({
                            "session_id": session.id,
                            "key_id": key_id,
                            "error": f"Mismatch: {len(answers)} answers submitted, but {total_questions} questions expected"
                        })
                        continue

                    # 5. Evaluate answers
                    correct_count = 0
                    for i, submitted_ans in enumerate(answers):
                        question = questions[i]
                        logger.debug("Key %s Q%d: submitted=%s", key_id, i+1, submitted_ans)

                        # Convert numeric answer (0–3) → letter (A–D)
                        if isinstance(submitted_ans, int) and 0 <= submitted_ans <= 3:
                            submitted_letter = chr(65 + submitted_ans)
                        else:
                            submitted_letter = None  # Unanswered or invalid
                            continue  # Skip scoring invalid

                        # Find the correct answer for that question
                        options = [question.option_a, question.option_b, question.option_c, question.option_d]
                        try:
                            correct_idx = options.index(question.correct_answer)
                            correct_letter = chr(65 + correct_idx)
                            # Compare submitted answer with correct answer
                            if submitted_letter == correct_letter:
                                correct_count += 1
                        except ValueError:
                            logger.warning("Q%d: correct_answer '%s' not in options %s", i+1, question.correct_answer, options)
                            continue

                    # 6. Compute total score and pass/fail
                    percentage = round((correct_count / total_questions) * 100, 2) if total_questions > 0 else 0
                    passed = percentage >= 80
                    logger.info("Scoring for key %s (session %s): %d/%d correct (%.2f%%), passed=%s",
                                key_id, session.id, correct_count, total_questions, percentage, passed)

                    # 7. Save result to database (append-only with unique TestSession per submission)
                    try:
                        with transaction.atomic():
                            # Generate unique key_id and test_name based on time, level, department, station
                            unique_key_id = f"remote-{key_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"
                            level_name = session.level.level_name if session.level else "N/A"
                            skill_name = session.skill.station_name if session.skill else "N/A"
                            dept_name = resolved_dept_name
                            current_time = datetime.now().strftime('%d/%m/%Y %H:%M')
                            unique_test_name = f"{skill_name} {level_name} question paper {current_time} - {dept_name}"

                            # Create or update unique TestSession
                            test_session, test_created = TestSession.objects.get_or_create(
                                employee=session.employee,
                                question_paper=session.question_paper,
                                key_id=unique_key_id,
                                defaults={
                                    "test_name": unique_test_name,
                                    "level": session.level,
                                    "skill": session.skill,
                                    "department": score_department,
                                }
                            )

                            # Check if a score already exists for this unique test_session
                            existing_score = Score.objects.filter(
                                employee=session.employee,
                                test=test_session,
                                skill=session.skill
                            ).exists()

                            if existing_score:
                                logger.info("Score already exists for employee=%s, unique test_session=%s, skill=%s - skipping to avoid duplicates",
                                            session.employee.emp_id, test_session.id, session.skill.station_name if session.skill else "None")
                                error_results.append({
                                    "session_id": session.id,
                                    "key_id": key_id,
                                    "unique_test_session_id": test_session.id,
                                    "unique_test_name": unique_test_name,
                                    "error": "Score already exists for unique test - skipped to avoid duplicates"
                                })
                                continue

                            # Create a new Score object linked to the unique TestSession
                            score = Score.objects.create(
                                employee=session.employee,
                                test=test_session,
                                marks=correct_count,
                                percentage=percentage,  # Assuming percentage is float; adjust if Decimal needed
                                passed=passed,
                                level=session.level,
                                skill=session.skill,
                                department=score_department,
                                raw_answers=answers
                            )

                            # Trigger model's save() for auto-fills if needed
                            score.save()

                            logger.info("Created unique TestSession %s and new Score %s for employee %s (original session %s%s)",
                                        test_session.id, score.id, session.employee.emp_id, session.id, " (template)" if template_created else "")

                            # Collect successful result (using emp_name field for MasterTable)
                            employee_name = getattr(session.employee, 'emp_name', str(session.employee))
                            successful_results.append({
                                "session_id": session.id,
                                "key_id": key_id,
                                "unique_test_session_id": test_session.id,
                                "unique_test_name": unique_test_name,
                                "employee_name": employee_name,
                                "marks": correct_count,
                                "percentage": percentage,
                                "passed": passed,
                                "level": level_name,
                                "skill": skill_name,
                                "department": resolved_dept_name,
                            })
                    except Exception as save_err:
                        logger.error("Error saving unique TestSession/Score for session %s (key %s): %s", session.id, key_id, save_err)
                        error_results.append({"session_id": session.id, "key_id": key_id, "error": str(save_err)})
                        continue

            # Group successful results by unique_test_name
            grouped_results = []
            if successful_results:
                grouped_by_test = defaultdict(list)
                for result in successful_results:
                    test_name = result["unique_test_name"]
                    employee_name = result["employee_name"]
                    grouped_by_test[test_name].append(employee_name)

                # Sort employees alphabetically for consistency
                for test_name, employees in grouped_by_test.items():
                    grouped_results.append({
                        "test_name": test_name,
                        "employees": sorted(employees)
                    })

                # Sort grouped_results by test_name for consistency
                grouped_results.sort(key=lambda x: x["test_name"])

            # 9. Error handling: Return grouped results and errors
            response_data = {
                "grouped_results": grouped_results
            }
            if error_results:
                response_data["errors"] = error_results

            logger.info("EndTestSessionView completed with %d grouped results and %d errors", len(grouped_results), len(error_results))
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            error_trace = traceback.format_exc()
            logger.error("Unhandled error in EndTestSessionView: %s\n%s", str(e), error_trace)
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import OuterRef, Subquery
from .models import MasterTable, Score, RetrainingSession, RetrainingSessionDetail, RetrainingConfig



class EvaluationEligibleEmployeeListView(APIView):
    """
    API to list employees eligible to attempt evaluation test or show reason otherwise.
    Accepts query params: level_id, department_id, station_id
    """
    def get(self, request):
        level_id = request.query_params.get('level_id')
        department_id = request.query_params.get('department_id')
        station_id = request.query_params.get('station_id')
        if not level_id or not department_id:
            return Response({"error": "level_id and department_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_level = int(level_id)
            target_station = int(station_id) if station_id else None
        except (ValueError, TypeError):
             return Response({"error": "Invalid level_id or station_id format"}, status=status.HTTP_400_BAD_REQUEST)

        employees = MasterTable.objects.all() # Fetch all initially, filter later or optimize queryset

        # Optimization: Fetch all passed scores for relevant employees (or all, if list is small enough)
        # To avoid fetching all scores in DB, filter by current candidates if possible.
        # But 'employees' is defined as MasterTable.objects above (line 13717 in original was `employees = MasterTable.objects`).
        # Original code used `employees = MasterTable.objects` then annotated.
        # I should keep the base queryset.
        
        # Let's preserve the annotation logic for last_attempt/passed of THIS level/station 
        # because the frontend/logic uses it.
        # However, for the NEW logic (Prereqs), we need more data.
        
        # employees = MasterTable.objects.filter(department_id=department_id) 
        # Reverting strict filtering to match original behavior and ensure visibility.
        pass 

        # Start with all employees to be safe as per original 'MasterTable.objects' 
        # (Wait, original request.query_params had department_id, but the view queried `MasterTable.objects` 
        # and then seemingly didn't filter by department in the initial queryset? 
        # Ah, looking at line 13717: `employees = MasterTable.objects`. 
        # Then it annotated.
        # Then in the loop: `if hasattr(emp, 'department') ... department_name`. 
        # It didn't strictly filter MasterTable by department_id?
        # Re-reading original code:
        # `latest_score_qs` filters by `department_id`.
        # The loop generates response.
        # It seems it returned ALL employees? That seems inefficient if so.
        # But `evaluation-eligible-employees` expects `department_id`. 
        # If I look at the loop `for emp in employees:`, if `employees` is `MasterTable.objects` (Manager), 
        # iterating it fetches ALL rows. This matches the original inefficient behavior.
        # I will ADD department filtering if it makes sense, but the user didn't ask to fix perf, just logic.
        # I will stick to the logic change.
        
        # Construct the queryset as before
        latest_score_qs = Score.objects.filter(
            employee=OuterRef('pk'),
            level_id=level_id,
            department_id=department_id,
            skill_id=station_id
        ).order_by('-attempt_no')

        employees = employees.annotate(
            last_attempt_no=Subquery(latest_score_qs.values('attempt_no')[:1]),
            last_passed=Subquery(latest_score_qs.values('passed')[:1])
        )

        # Pre-fetch passed scores for all employees to handle prerequisites efficiently
        # We need to check passed status for L1, L2, L3 etc.
        # Since we might be iterating many employees, a bulk fetch is better.
        passed_scores_data = Score.objects.filter(passed=True).values('employee_id', 'level_id', 'skill_id')
        
        # Build a map: emp_id -> { level_id: set(skill_ids) }
        emp_passed_map = {}
        for entry in passed_scores_data:
            e_id = entry['employee_id']
            l_id = entry['level_id']
            s_id = entry['skill_id']
            
            if e_id not in emp_passed_map:
                emp_passed_map[e_id] = {}
            if l_id not in emp_passed_map[e_id]:
                emp_passed_map[e_id][l_id] = set()
            emp_passed_map[e_id][l_id].add(s_id)


        config = RetrainingConfig.objects.filter(evaluation_type='Evaluation').first()
        max_attempts = config.max_count if config else 2
        
        response_list = []
        for emp in employees:
            department_name = ""
            if hasattr(emp, 'department') and emp.department:
                department_name = emp.department.department_name
                
                # Optional: Filter by department if desired/implied by usage, 
                # but following original exact flow:
                # Original didn't filter `employees` by `department_id` in the queryset, 
                # only used it in `latest_score_qs`.
                # Wait, strictly speaking, if `department_id` param is passed, usually we want employees OF that department.
                # But I shouldn't change that behavior if not asked.
            
            # ------------------------------------------------------------------
            # SKILL MATRIX FILTERING LOGIC
            # ------------------------------------------------------------------
            # Check prerequisites based on target_level
            
            passed_levels = emp_passed_map.get(emp.emp_id, {})
            
            # Helper to check if passed a specific level (any station or specific)
            def has_passed_level(lvl, station=None):
                stations_passed = passed_levels.get(lvl, set())
                if station is None:
                    return len(stations_passed) > 0 # Passed ANY station at this level
                return station in stations_passed

            is_eligible_logic = True
            logic_reason = None

            if target_level == 1:
                # Candidate: NOT passed Level 1 (General/Any)
                # Exclude: Already passed Level 1
                if has_passed_level(1):
                     continue # Skip completely (don't show)

            elif target_level == 2:
                # Candidate: Passed Level 1 (General)
                # Exclude: Passed Level 2 (Selected Station)
                
                # Prereq: Must have passed Level 1
                if not has_passed_level(1):
                    continue # Not eligible to see
                    
                # Exclude: Already passed Level 2 for THIS station
                if has_passed_level(2, target_station):
                    continue # Already done

            elif target_level == 3:
                # Candidate: Passed Level 2 (Selected Station)
                # Exclude: Passed Level 3 (Selected Station)
                
                # Prereq: Must have passed Level 2 for THIS station
                if not has_passed_level(2, target_station):
                    continue 

                # Exclude: Already passed Level 3 for THIS station
                if has_passed_level(3, target_station):
                    continue

            elif target_level == 4:
                # Candidate: Passed Level 3 (Selected Station)
                # Exclude: Passed Level 4 (Selected Station)

                # Prereq: Must have passed Level 3 for THIS station
                if not has_passed_level(3, target_station):
                    continue

                # Exclude: Already passed Level 4 for THIS station
                if has_passed_level(4, target_station):
                    continue
            
            # ------------------------------------------------------------------
            # END SKILL MATRIX LOGIC
            # ------------------------------------------------------------------


            last_attempt_no = emp.last_attempt_no

            # Never attended test (for THIS level/station/dept combination)
            if last_attempt_no is None:
                response_list.append({
                    "id": emp.emp_id,
                    "emp_id": emp.emp_id,
                    "name": f"{emp.first_name or ''} {emp.last_name or ''}".strip(),
                    "department": department_name,
                    "eligible": True,
                    "reason": "Never attended test"
                })
                continue

            # Passed last attempt - exclude from eligible list (Existing Logic)
            # My new logic above already handles "Already Passed" filtering more robustly for multi-level.
            # But this check relies on `last_passed` annotation which is specific to params.
            # It's redundant but safe to keep for "current request" context if annotation matches logic.
            if emp.last_passed:
                continue

            # Failed last attempt and max attempts reached
            if last_attempt_no >= max_attempts:
                response_list.append({
                    "id": emp.emp_id,
                    "emp_id": emp.emp_id,
                    "name": f"{emp.first_name or ''} {emp.last_name or ''}".strip(),
                    "department": department_name,
                    "eligible": False,
                    "reason": f"Max attempts ({max_attempts}) reached"
                })
                continue

            # Check retraining session and details
            retraining_qs = RetrainingSession.objects.filter(
                employee=emp,
                level_id=level_id,
                department_id=department_id,
                station_id=station_id,
                evaluation_type='Evaluation',
                attempt_no=last_attempt_no,
                status='Scheduled'
            )

            has_retraining = retraining_qs.exists()

            has_retraining_detail = RetrainingSessionDetail.objects.filter(
                retraining_session__in=retraining_qs
            ).exists()

            if has_retraining and has_retraining_detail:
                response_list.append({
                    "id": emp.emp_id,
                    "emp_id": emp.emp_id,
                    "name": f"{emp.first_name or ''} {emp.last_name or ''}".strip(),
                    "department": department_name,
                    "eligible": True,
                    "reason": "Retraining scheduled and session detail exists"
                })
            else:
                response_list.append({
                    "id": emp.emp_id,
                    "emp_id": emp.emp_id,
                    "name": f"{emp.first_name or ''} {emp.last_name or ''}".strip(),
                    "department": department_name,
                    "eligible": False,
                    "reason": "Retraining not scheduled or Retraining session detail missing"
                })

        return Response({"employees": response_list}, status=status.HTTP_200_OK)




class ScoreListView(APIView):
    def get(self, request):
        # Assuming you use caching for latest test session
        session_key = cache.get("latest_test_session")
        if not session_key:
            return Response([])

        scores = Score.objects.filter(test__key_id=session_key).select_related('employee', 'level', 'skill')
        serializer = ScoreSerializer(scores, many=True)
        return Response(serializer.data)


class KeyIdToEmployeeNameMap(APIView):
    def get(self, request):
        mapping = TestSession.objects.select_related('employee').all()
        return Response({
            s.key_id: f"{s.employee.first_name} {s.employee.last_name}" 
            for s in mapping
        })


class PastTestSessionsView(APIView):
    def get(self, request):
        # Get distinct test names from Score model through the test relationship
        test_names = Score.objects.select_related('test').filter(
            test__isnull=False
        ).values_list('test__test_name', flat=True).distinct()
        
        return Response(list(test_names))

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from app1.models import Score
from app1.serializers import ScoreSerializer
import traceback

class ScoresByTestView(APIView):
    def get(self, request, name):
        try:
            scores = (
                Score.objects
                .filter(test__test_name=name)
                .select_related(
                    'employee', 'employee__department',
                    'department',
                    'skill', 'skill__subline', 'skill__subline__line', 'skill__subline__line__department',
                    'level', 'test', 'test__department'
                )
            )
            serializer = ScoreSerializer(scores, many=True)
            print("Final data being sent to frontend:", serializer.data)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in ScoresByTestView: {e}")
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class SkillListView(APIView):
    def get(self, request):
        skills = Station.objects.values_list('station_name', flat=True).distinct()
        return Response(list(skills))


class ResultSummaryAPIView(APIView):
    def get(self, request):
        try:
            scores = Score.objects.select_related('employee', 'level', 'skill')
            data = []
            for score in scores:
                # Use the percentage from the score model instead of recalculating
                percentage = score.percentage
                result = 'Pass' if score.percentage >= 80 else 'Retraining' if score.percentage >= 50 else 'Fail'

                data.append({
                    "employee_id": score.employee.emp_id if hasattr(score.employee, 'emp_id') else score.employee.id,
                    "name": f"{score.employee.first_name} {score.employee.last_name}",
                    "marks": score.marks,
                    "percentage": percentage,
                    "section": score.employee.section if hasattr(score.employee, 'section') else '',
                    "level_name": score.level.level_name if score.level and hasattr(score.level, 'level_name') else '',
                    "skill": score.skill.station_name if score.skill and hasattr(score.skill, 'station_name') else (score.skill.skill if score.skill else ''),
                    "result": result,
                })

            serializer = SimpleScoreSerializer(data, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"Error in ResultSummaryAPIView: {e}")
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import MasterTable, QuestionPaper, Station, Level, TestSession, Score, TemplateQuestion, Department
# from decimal import Decimal
# import logging
# import traceback
# from django.conf import settings
# from django.db import transaction

# logger = logging.getLogger(__name__)

# class SubmitWebTestAPIView(APIView):
#     """
#     Submit test answers from web/tablet exam (without remote).
#     """
#     def post(self, request):
#         try:
#             logger.info("SubmitWebTestAPIView called with data: %s", request.data)

#             employee_id = request.data.get("employee_id")
#             test_name = request.data.get("test_name")
#             question_paper_id = request.data.get("question_paper_id")
#             answers = request.data.get("answers", [])
#             skill_id = request.data.get("skill_id")
#             level_id = request.data.get("level_id")
#             department_name = request.data.get("department_name")  # Added

#             # Validate required fields
#             if not all([employee_id, test_name, question_paper_id, level_id, department_name]) or not isinstance(answers, list):
#                 logger.warning("Validation failed: missing required fields.")
#                 return Response(
#                     {"error": "employee_id, test_name, question_paper_id, level_id, department_name, and answers[] are required."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Get employee, question paper, level, and department objects
#             logger.debug("Fetching employee_id=%s", employee_id)
#             employee = get_object_or_404(MasterTable, emp_id=employee_id)

#             logger.debug("Fetching question_paper_id=%s", question_paper_id)
#             question_paper = get_object_or_404(QuestionPaper, question_paper_id=question_paper_id)
            
#             logger.debug("Fetching level_id=%s", level_id)
#             level_object = get_object_or_404(Level, level_id=level_id)

#             # Fetch department
#             logger.debug("Fetching department_name=%s", department_name)
#             department = get_object_or_404(Department, department_name=department_name)

#             # Log department details for debugging
#             logger.debug("Employee.department: %s", employee.department.department_name if employee.department else "None")
#             logger.debug("QuestionPaper.department: %s", question_paper.department.department_name if question_paper.department else "None")
#             logger.debug("Submitted department_name: %s", department_name)

#             # Handle skill (station)
#             skill_object = None
#             if skill_id:
#                 logger.debug("Fetching skill (station) by id=%s", skill_id)
#                 skill_object = get_object_or_404(Station, station_id=skill_id)

#             # Get all questions related to the question paper
#             questions = list(question_paper.template_questions.all().order_by("id"))
#             total_questions = len(questions)
#             logger.info("Total questions found: %s", total_questions)

#             if total_questions == 0:
#                 logger.error("No questions found for paper id=%s", question_paper_id)
#                 return Response({"error": "No questions found for this paper."}, status=status.HTTP_400_BAD_REQUEST)

#             # Compare answers
#             correct_count = 0
#             for i, ans in enumerate(answers):
#                 if i < total_questions:
#                     question = questions[i]
#                     options = [question.option_a, question.option_b, question.option_c, question.option_d]
#                     try:
#                         correct_index = options.index(question.correct_answer)
#                     except ValueError:
#                         correct_index = -1
#                     logger.debug("Q%s: submitted=%s, correct_index=%s", i+1, ans, correct_index)
#                     if ans == correct_index:
#                         correct_count += 1

#             # Get Dynamic Passing Criteria
#             required_percentage = Decimal('80.00')
#             try:
#                 passing_criteria = EvaluationPassingCriteria.objects.filter(
#                     level=question_paper.level,
#                     department=question_paper.department
#                 ).first()
#                 if passing_criteria:
#                     required_percentage = passing_criteria.percentage
#             except Exception as e:
#                 logger.error("Error retrieving passing criteria: %s", e)

#             # Calculate percentage
#             if total_questions > 0:
#                 percentage_decimal = Decimal(correct_count) / Decimal(total_questions) * Decimal('100')
#                 percentage_decimal = percentage_decimal.quantize(Decimal('0.01'))
#                 percentage = float(percentage_decimal)
#             else:
#                 percentage_decimal = Decimal('0.00')
#                 percentage = 0.0

#             passed = percentage_decimal >= required_percentage
#             logger.info("Scoring: %s/%s correct (%.2f%%), passed=%s",
#                         correct_count, total_questions, percentage, passed)

#             # Create or update TestSession and Score
#             with transaction.atomic():
#                 test_session, _ = TestSession.objects.get_or_create(
#                     employee=employee,
#                     question_paper=question_paper,
#                     key_id=f"web-{employee_id}-{question_paper_id}",
#                     defaults={
#                         "test_name": test_name,
#                         "level": level_object,
#                         "skill": skill_object,
#                         "department": department,  # Store Forging
#                     }
#                 )

#                 score, created = Score.objects.get_or_create(
#                     employee=employee,
#                     test=test_session,
#                     defaults={
#                         'marks': correct_count,
#                         'percentage': percentage,
#                         'passed': passed,
#                         'skill': skill_object,
#                         'level': level_object,
#                         'department': department,  # Store Forging
#                     }
#                 )

#                 if not created:
#                     logger.info("Updating existing score for employee=%s", employee.emp_id)
#                     score.marks = correct_count
#                     score.percentage = percentage
#                     score.passed = passed
#                     score.skill = skill_object
#                     score.level = level_object
#                     score.department = department  # Update to Forging
#                     score.save()

#             logger.debug("Score.department: %s", score.department.department_name if score.department else "None")

#             return Response({
#                 "employee": f"{employee.first_name} {employee.last_name}",
#                 "marks": correct_count,
#                 "total_questions": total_questions,
#                 "percentage": percentage,
#                 "passed": passed,
#                 "level_received": level_object.level_name,
#                 "department": department.department_name,  # Return Forging
#                 "message": "Score saved successfully"
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_trace = traceback.format_exc()
#             logger.error("Error in SubmitWebTestAPIView: %s\n%s", str(e), error_trace)
#             return Response({
#                 "error": str(e),
#                 "traceback": error_trace if settings.DEBUG else "An internal server error occurred."
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# end evaluation





        
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import MasterTable, QuestionPaper, Station, Level, TestSession, Score, TemplateQuestion, Department
from decimal import Decimal
import logging
import traceback
from django.conf import settings
from django.db import transaction

logger = logging.getLogger(__name__)





# class SubmitWebTestAPIView(APIView):
#     """
#     Submit test answers from web/tablet exam (without remote).
#     """
#     def post(self, request):
#         try:
#             logger.info("SubmitWebTestAPIView called with data: %s", request.data)

#             employee_id = request.data.get("employee_id")
#             test_name = request.data.get("test_name")
#             question_paper_id = request.data.get("question_paper_id")
#             answers = request.data.get("answers", [])
#             skill_id = request.data.get("skill_id")
#             level_id = request.data.get("level_id")
#             department_name = request.data.get("department_name")  # Added

#             # Validate required fields
#             if not all([employee_id, test_name, question_paper_id, level_id, department_name]) or not isinstance(answers, list):
#                 logger.warning("Validation failed: missing required fields.")
#                 return Response(
#                     {"error": "employee_id, test_name, question_paper_id, level_id, department_name, and answers[] are required."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Get employee, question paper, level, and department objects
#             logger.debug("Fetching employee_id=%s", employee_id)
#             employee = get_object_or_404(MasterTable, emp_id=employee_id)

#             logger.debug("Fetching question_paper_id=%s", question_paper_id)
#             question_paper = get_object_or_404(QuestionPaper, question_paper_id=question_paper_id)
            
#             logger.debug("Fetching level_id=%s", level_id)
#             level_object = get_object_or_404(Level, level_id=level_id)

#             # Fetch department
#             logger.debug("Fetching department_name=%s", department_name)
#             department = get_object_or_404(Department, department_name=department_name)

#             # Log department details for debugging
#             logger.debug("Employee.department: %s", employee.department.department_name if employee.department else "None")
#             logger.debug("QuestionPaper.department: %s", question_paper.department.department_name if question_paper.department else "None")
#             logger.debug("Submitted department_name: %s", department_name)

#             # Handle skill (station)
#             skill_object = None
#             if skill_id:
#                 logger.debug("Fetching skill (station) by id=%s", skill_id)
#                 skill_object = get_object_or_404(Station, station_id=skill_id)

#             # Get all questions related to the question paper
#             questions = list(question_paper.template_questions.all().order_by("id"))
#             total_questions = len(questions)
#             logger.info("Total questions found: %s", total_questions)

#             if total_questions == 0:
#                 logger.error("No questions found for paper id=%s", question_paper_id)
#                 return Response({"error": "No questions found for this paper."}, status=status.HTTP_400_BAD_REQUEST)

#             # Compare answers
#             correct_count = 0
#             for i, ans in enumerate(answers):
#                 if i < total_questions:
#                     question = questions[i]
#                     options = [question.option_a, question.option_b, question.option_c, question.option_d]
#                     try:
#                         correct_index = options.index(question.correct_answer)
#                     except ValueError:
#                         correct_index = -1
#                     logger.debug("Q%s: submitted=%s, correct_index=%s", i+1, ans, correct_index)
#                     if ans == correct_index:
#                         correct_count += 1

#             # Get Dynamic Passing Criteria
#             required_percentage = Decimal('80.00')
#             try:
#                 passing_criteria = EvaluationPassingCriteria.objects.filter(
#                     level=question_paper.level,
#                     department=question_paper.department
#                 ).first()
#                 if passing_criteria:
#                     required_percentage = passing_criteria.percentage
#             except Exception as e:
#                 logger.error("Error retrieving passing criteria: %s", e)

#             # Calculate percentage
#             if total_questions > 0:
#                 percentage_decimal = Decimal(correct_count) / Decimal(total_questions) * Decimal('100')
#                 percentage_decimal = percentage_decimal.quantize(Decimal('0.01'))
#                 percentage = float(percentage_decimal)
#             else:
#                 percentage_decimal = Decimal('0.00')
#                 percentage = 0.0

#             passed = percentage_decimal >= required_percentage
#             logger.info("Scoring: %s/%s correct (%.2f%%), passed=%s",
#                         correct_count, total_questions, percentage, passed)

#             # Create or update TestSession and Score
#             with transaction.atomic():
#                 test_session, _ = TestSession.objects.get_or_create(
#                     employee=employee,
#                     question_paper=question_paper,
#                     key_id=f"web-{employee_id}-{question_paper_id}",
#                     defaults={
#                         "test_name": test_name,
#                         "level": level_object,
#                         "skill": skill_object,
#                         "department": department,  # Store Forging
#                     }
#                 )

#                 score, created = Score.objects.get_or_create(
#                     employee=employee,
#                     test=test_session,
#                     defaults={
#                         'marks': correct_count,
#                         'percentage': percentage,
#                         'passed': passed,
#                         'skill': skill_object,
#                         'level': level_object,
#                         'department': department,
#                         'raw_answers': answers,  # Store Forging
#                     }
#                 )

#                 if not created:
#                     logger.info("Updating existing score for employee=%s", employee.emp_id)
#                     score.marks = correct_count
#                     score.percentage = percentage
#                     score.passed = passed
#                     score.skill = skill_object
#                     score.level = level_object
#                     score.department = department  # Update to Forging
#                     score.raw_answers = answers
#                     score.save()

#             logger.debug("Score.department: %s", score.department.department_name if score.department else "None")

#             return Response({
#                 "employee": f"{employee.first_name} {employee.last_name}",
#                 "marks": correct_count,
#                 "total_questions": total_questions,
#                 "percentage": percentage,
#                 "passed": passed,
#                 "level_received": level_object.level_name,
#                 "department": department.department_name,  # Return Forging
#                 "message": "Score saved successfully"
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_trace = traceback.format_exc()
#             logger.error("Error in SubmitWebTestAPIView: %s\n%s", str(e), error_trace)
#             return Response({
#                 "error": str(e),
#                 "traceback": error_trace if settings.DEBUG else "An internal server error occurred."
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class SubmitWebTestAPIView(APIView):
    """
    Submit test answers from web/tablet exam (without remote).
    """
    def post(self, request):
        try:
            logger.info("SubmitWebTestAPIView called with data: %s", request.data)

            employee_id = request.data.get("employee_id")
            test_name = request.data.get("test_name")
            question_paper_id = request.data.get("question_paper_id")
            answers = request.data.get("answers", [])
            skill_id = request.data.get("skill_id")
            level_id = request.data.get("level_id")
            department_name = request.data.get("department_name")  # Added

            # Validate required fields
            if not all([employee_id, test_name, question_paper_id, level_id, department_name]) or not isinstance(answers, list):
                logger.warning("Validation failed: missing required fields.")
                return Response(
                    {"error": "employee_id, test_name, question_paper_id, level_id, department_name, and answers[] are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get employee, question paper, level, and department objects
            logger.debug("Fetching employee_id=%s", employee_id)
            employee = get_object_or_404(MasterTable, emp_id=employee_id)
            logger.debug("Fetching question_paper_id=%s", question_paper_id)
            question_paper = get_object_or_404(QuestionPaper, question_paper_id=question_paper_id)
            logger.debug("Fetching level_id=%s", level_id)
            level_object = get_object_or_404(Level, level_id=level_id)
            logger.debug("Fetching department_name=%s", department_name)
            department = get_object_or_404(Department, department_name=department_name)

            # Log department details for debugging
            logger.debug("Employee.department: %s", employee.department.department_name if employee.department else "None")
            logger.debug("QuestionPaper.department: %s", question_paper.department.department_name if question_paper.department else "None")
            logger.debug("Submitted department_name: %s", department_name)

            # Handle skill (station)
            skill_object = None
            if skill_id:
                logger.debug("Fetching skill (station) by id=%s", skill_id)
                skill_object = get_object_or_404(Station, station_id=skill_id)

            # Get all questions related to the question paper
            questions = list(question_paper.template_questions.all().order_by("id"))
            total_questions = len(questions)
            logger.info("Total questions found: %s", total_questions)

            if total_questions == 0:
                logger.error("No questions found for paper id=%s", question_paper_id)
                return Response({"error": "No questions found for this paper."}, status=status.HTTP_400_BAD_REQUEST)

            # Compare answers
            correct_count = 0
            for i, ans in enumerate(answers):
                if i < total_questions:
                    question = questions[i]
                    options = [question.option_a, question.option_b, question.option_c, question.option_d]
                    try:
                        correct_index = options.index(question.correct_answer)
                    except ValueError:
                        correct_index = -1
                    logger.debug("Q%s: submitted=%s, correct_index=%s", i+1, ans, correct_index)
                    if ans == correct_index:
                        correct_count += 1

            # Get Dynamic Passing Criteria
            required_percentage = Decimal('80.00')
            try:
                passing_criteria = EvaluationPassingCriteria.objects.filter(
                    level=question_paper.level,
                    department=question_paper.department
                ).first()
                if passing_criteria:
                    required_percentage = passing_criteria.percentage
            except Exception as e:
                logger.error("Error retrieving passing criteria: %s", e)

            # Calculate percentage
            if total_questions > 0:
                percentage_decimal = Decimal(correct_count) / Decimal(total_questions) * Decimal('100')
                percentage_decimal = percentage_decimal.quantize(Decimal('0.01'))
                percentage = float(percentage_decimal)
            else:
                percentage_decimal = Decimal('0.00')
                percentage = 0.0

            passed = percentage_decimal >= required_percentage
            logger.info("Scoring: %s/%s correct (%.2f%%), passed=%s",
                        correct_count, total_questions, percentage, passed)

            # ==== NEW RETRAINING/ATTEMPT LOGIC START ====
            from .models import RetrainingSession, RetrainingSessionDetail, RetrainingConfig, Score

            # Calculate the next attempt number for this employee/level/dept/skill
            prev_scores = Score.objects.filter(
                employee=employee,
                level=level_object,
                department=department,
                skill=skill_object
            ).order_by('-attempt_no')

            last_score = prev_scores.first()
            attempt_no = 1 if not last_score else last_score.attempt_no + 1

            # Get max_attempts from config (or use default)
            config = RetrainingConfig.objects.filter(evaluation_type='Evaluation').first()
            max_attempts = config.max_count if config else 2

            if attempt_no > max_attempts:
                return Response({'error': 'Maximum allowed attempts reached for this evaluation.'}, status=400)

            # If attempt_no > 1, require a scheduled retraining session + session detail for previous fail
            retraining = None
            retraining_detail_exists = False
            if attempt_no > 1:
                retraining = RetrainingSession.objects.filter(
                    employee=employee,
                    level=level_object,
                    department=department,
                    station=skill_object,
                    evaluation_type='Evaluation',
                    status='Scheduled',
                    attempt_no=attempt_no - 1
                ).order_by('-created_at').first()
                retraining_detail_exists = retraining and RetrainingSessionDetail.objects.filter(retraining_session=retraining).exists()
                if not (retraining and retraining_detail_exists):
                    return Response({'error': 'You must have a scheduled retraining session with details entered for your previous failed attempt before continuing.'}, status=400)
            # ==== NEW RETRAINING/ATTEMPT LOGIC END ====

            # Create or update TestSession and Score
            with transaction.atomic():
                test_session, _ = TestSession.objects.get_or_create(
                    employee=employee,
                    question_paper=question_paper,
                    key_id=f"web-{employee_id}-{question_paper_id}",
                    defaults={
                        "test_name": test_name,
                        "level": level_object,
                        "skill": skill_object,
                        "department": department,  # Store Forging
                    }
                )

                # ==== UPDATED: Always set attempt_no on Score ====
                score, created = Score.objects.get_or_create(
                    employee=employee,
                    test=test_session,
                    attempt_no=attempt_no,  # NEW: set attempt_no here
                    defaults={
                        'marks': correct_count,
                        'percentage': percentage,
                        'passed': passed,
                        'skill': skill_object,
                        'level': level_object,
                        'department': department,
                        'raw_answers': answers,  # Store Forging
                    }
                )

                if not created:
                    logger.info("Updating existing score for employee=%s", employee.emp_id)
                    score.marks = correct_count
                    score.percentage = percentage
                    score.passed = passed
                    score.skill = skill_object
                    score.level = level_object
                    score.department = department  # Update to Forging
                    score.raw_answers = answers
                    score.attempt_no = attempt_no  # NEW: Ensure updated
                    score.save()

                # ==== NEW: Mark retraining session as 'Completed' after new attempt ====
                if attempt_no > 1 and retraining and retraining.status == 'Scheduled':
                    retraining.status = 'Completed'
                    retraining.save(update_fields=['status'])
                # ==== END NEW ====

            logger.debug("Score.department: %s", score.department.department_name if score.department else "None")

            return Response({
                "employee": f"{employee.first_name} {employee.last_name}",
                "marks": correct_count,
                "total_questions": total_questions,
                "percentage": percentage,
                "passed": passed,
                "level_received": level_object.level_name,
                "department": department.department_name,  # Return Forging
                "attempt_no": attempt_no,  # NEW: return this for frontend/debug
                "message": "Score saved successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            error_trace = traceback.format_exc()
            logger.error("Error in SubmitWebTestAPIView: %s\n%s", str(e), error_trace)
            return Response({
                "error": str(e),
                "traceback": error_trace if settings.DEBUG else "An internal server error occurred."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)








from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count

from .models import AnnualPlan, ObservationSheet, ObservationLineItem, StatusChoices
from .serializers import AnnualPlanSerializer, ObservationSheetSerializer
# Adjust the import path for your OperatorMaster model and serializer
from .models import MasterTable
from .serializers import MasterTableSerializer # Assuming serializer is in this app

# --- API Views ---




class AnnualPlanViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creating, viewing, and managing Annual Plans.
    """
    # Use select_related to optimize the query by fetching the employee
    # data in the same database call, preventing N+1 query issues.
    queryset = AnnualPlan.objects.select_related('employee').all().order_by('-created_at')
    serializer_class = AnnualPlanSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        A custom endpoint to get quick overview statistics for the dashboard.
        Accessible at /api/plans/stats/
        """
        all_plans = self.get_queryset()
        
        total_count = all_plans.count()
        completed_count = all_plans.filter(status=StatusChoices.COMPLETED).count()
        pending_count = total_count - completed_count # Or query for 'planned' status

        stats_data = {
            'total': total_count,
            'completed': completed_count,
            'pending': pending_count
        }
        return Response(stats_data, status=status.HTTP_200_OK)


# --- Imports ---
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime
import logging

# --- Your Models and Serializers ---
# Make sure these import paths are correct for your project
from .models import TenCycleSheet, TencycleEntrySheet, MasterTable 
from .serializers import (
    TenCycleSheetSerializer, 
    TenCycleSheetDetailSerializer, 
    TencycleEntrySheetSerializer
)

logger = logging.getLogger(__name__)

# --- ViewSets ---

class TenCycleSheetViewSet(viewsets.ModelViewSet):
    queryset = TenCycleSheet.objects.all().select_related(
        'employee', 'station', 'line', 'department', 'level'
    ).prefetch_related('entries')
    serializer_class = TenCycleSheetSerializer
    # permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    # UPDATED: Removed 'machine' as it's not in the TenCycleSheet model
    filterset_fields = ['employee', 'station', 'line', 'date', 'department', 'level'] 
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TenCycleSheetDetailSerializer
        return TenCycleSheetSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
            
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(part_name__icontains=search) |
                Q(employee__first_name__icontains=search) |
                Q(employee__last_name__icontains=search)
            )
        
        return queryset.order_by('-date', '-id')
    
    def create(self, request, *args, **kwargs):
        """
        Override create to handle the specific data structure from frontend
        """
        try:
            data = request.data.copy()
            logger.info(f"Received data: {data}")
            annual_plan_id = data.pop('annual_plan', None)
            annual_plan = None

            if annual_plan_id:
                try:
                    annual_plan = AnnualPlan.objects.get(id=annual_plan_id)
                    # Optional: Prevent creating a sheet for an already completed plan
                    if annual_plan.status == StatusChoices.COMPLETED:
                        return Response(
                            {'error': f'The plan with ID {annual_plan_id} has already been completed.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except AnnualPlan.DoesNotExist:
                    return Response(
                        {'error': f'AnnualPlan with ID {annual_plan_id} not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            if 'employee' in data:
                employee_identifier = data['employee']
                try:
                    employee = MasterTable.objects.get(emp_id=employee_identifier)
                    data['employee'] = employee.emp_id  # Use the primary key
                    
                except MasterTable.DoesNotExist:
                    return Response(
                        {'error': f'Employee with emp_id {employee_identifier} not found'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # UPDATED: Removed 'operator_name' and 'operator_id' as they are not in the model.
            # The 'employee' field already covers this information.
            required_fields = ['employee', 'station', 'line', 'department', 'level']
            for field in required_fields:
                if field not in data or not data[field]:
                    return Response(
                        {'error': f'{field} is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if 'date' not in data or not data['date']:
                data['date'] = datetime.now().date()
            
            entries_data = data.get('entries', [])
            if not entries_data:
                return Response(
                    {'error': 'At least one entry is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            for entry in entries_data:
                if 's_no' not in entry or not entry['s_no']:
                    entry['s_no'] = '1'
                
                if 'cross_inspection_c' not in entry:
                    return Response(
                        {'error': 'cross_inspection_c is required in entry'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            
            sheet = serializer.save(annual_plan=annual_plan)
            if annual_plan:
                annual_plan.status = StatusChoices.COMPLETED
                annual_plan.save()
                logger.info(f"Updated AnnualPlan {annual_plan.id} to status COMPLETED.")

            
            return Response(
                TenCycleSheetDetailSerializer(sheet).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error creating TenCycleSheet: {str(e)}")
            if hasattr(e, 'detail'):
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                {'error': f'Failed to create sheet: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def entries(self, request, pk=None):
        """Get all entries for a specific sheet"""
        try:
            sheet = self.get_object()
            entries = sheet.entries.all()
            serializer = TencycleEntrySheetSerializer(entries, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching entries: {str(e)}")
            return Response(
                {'error': 'Failed to fetch entries'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def by_employee(self, request):
        """Get sheets filtered by employee"""
        employee_id = request.query_params.get('employee_id')
        department = request.query_params.get('department')
        level = request.query_params.get('level')
        if not employee_id:
            return Response(
                {'error': 'employee_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sheets = self.get_queryset().filter(employee_id=employee_id, department=department, level=level)
            serializer = self.get_serializer(sheets, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching sheets by employee: {str(e)}")
            return Response(
                {'error': 'Failed to fetch sheets'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def latest_entry(self, request):
        """Get the latest entry for a specific employee and station"""
        employee_id_from_param = request.query_params.get('employee_pay_code')
        station_id = request.query_params.get('station_id')
        department = request.query_params.get('department')
        level = request.query_params.get('level')
        line_id = request.query_params.get('line_id')
        
        if not employee_id_from_param or not station_id:
            return Response(
                {'error': 'employee_pay_code and station_id parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            try:
                employee = MasterTable.objects.get(emp_id=employee_id_from_param)
            except MasterTable.DoesNotExist:
                return Response(
                    {'error': 'Employee not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            latest_sheet = self.get_queryset().filter(
                employee=employee,
                station_id=station_id,
                line_id=line_id,
                department=department,
                level=level
            ).order_by('-date', '-id').first()
            
            if not latest_sheet:
                return Response(
                    {'message': 'No previous data found'},
                    # CORRECTED: Changed invalid status code to the standard 404
                    status=status.HTTP_404_NOT_FOUND 
                )
            
            serializer = TenCycleSheetDetailSerializer(latest_sheet)
            return Response({
                'message': 'Latest entry found',
                'data': serializer.data,
                'date': latest_sheet.date
            })
            
        except Exception as e:
            logger.error(f"Error fetching latest entry: {str(e)}")
            return Response(
                {'error': f'Failed to fetch latest entry: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )        

class TencycleEntrySheetViewSet(viewsets.ModelViewSet):
    # This ViewSet is generic and did not require changes.
    queryset = TencycleEntrySheet.objects.all().select_related('sheet')
    serializer_class = TencycleEntrySheetSerializer
    # permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        sheet_id = self.request.query_params.get('sheet')
        
        if sheet_id:
            queryset = queryset.filter(sheet_id=sheet_id)
            
        return queryset.order_by('s_no')
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create entries for a sheet"""
        try:
            sheet_id = request.data.get('sheet_id')
            entries_data = request.data.get('entries', [])
            
            if not sheet_id:
                return Response(
                    {'error': 'sheet_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not entries_data:
                return Response(
                    {'error': 'entries data is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                sheet = TenCycleSheet.objects.get(id=sheet_id)
            except TenCycleSheet.DoesNotExist:
                return Response(
                    {'error': 'Sheet not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            created_entries = []
            for entry_data in entries_data:
                entry_data['sheet'] = sheet.id
                serializer = self.get_serializer(data=entry_data)
                if serializer.is_valid():
                    entry = serializer.save()
                    created_entries.append(serializer.data)
                else:
                    return Response(
                        {'error': 'Invalid entry data', 'details': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            return Response(
                {'message': 'Entries created successfully', 'entries': created_entries},
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error in bulk_create: {str(e)}")
            return Response(
                {'error': f'Failed to create entries: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        



class ObservationSheetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for submitting and viewing Observation Sheets.
    The most important logic is here: updating the related plan's status.
    """
    queryset = ObservationSheet.objects.select_related('annual_plan__employee').all()
    serializer_class = ObservationSheetSerializer

    def perform_create(self, serializer):
        """
        THIS IS THE CORRECTED LOGIC.
        When a sheet is first created, the plan's status becomes 'In Progress'.
        """
        observation_sheet = serializer.save()
        annual_plan = observation_sheet.annual_plan
        
        # Only change status if the plan was 'planned'
        if annual_plan and annual_plan.status == StatusChoices.PLANNED:
            annual_plan.status = StatusChoices.IN_PROGRESS
            annual_plan.save(update_fields=['status', 'updated_at'])

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """
        This action marks the plan as 'Completed'.
        It is ONLY called when the user clicks the "Finalize" button.
        """
        sheet = self.get_object()
        plan = sheet.annual_plan
        
        if plan.status == StatusChoices.IN_PROGRESS:
            plan.status = StatusChoices.COMPLETED
            plan.save(update_fields=['status', 'updated_at'])
            return Response({'status': 'Plan finalized and marked as completed.'}, status=status.HTTP_200_OK)
        
        # Handle cases where it's already completed or still planned
        if plan.status == StatusChoices.COMPLETED:
            return Response({'status': 'Plan is already finalized.'}, status=status.HTTP_200_OK)
            
        return Response({'error': 'Plan is not in a state that can be finalized.'}, status=status.HTTP_400_BAD_REQUEST)
    





# In your_app/views.py

from rest_framework import viewsets
from .models import Question # Import new model
from .serializers import QuestionSerializer # Import new serializer

# ... your existing views ...

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    
    # This allows filtering like /api/questions/?subtopiccontent=5
    def get_queryset(self):
        queryset = super().get_queryset()
        subtopiccontent_id = self.request.query_params.get('subtopiccontent')
        if subtopiccontent_id:
            queryset = queryset.filter(subtopiccontent_id=subtopiccontent_id)
        return queryset
    



from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

# Assuming your models are in the current app's models.py
from .models import Score, TemplateQuestion

logger = logging.getLogger(__name__)

class AnswerSheetView(APIView):
    """
    Retrieves the detailed answer sheet for a specific score ID, including image URLs.
    """
    def get(self, request, score_id):
        print("--- EXECUTING THE *NEW* ANSWERSHEET VIEW CODE ---")    
        try:
            # 1. Fetch Score by ID with related objects for efficiency
            score = get_object_or_404(
                Score.objects.select_related(
                    'test__question_paper', 
                    'employee', 
                    'department', 
                    'skill',  # Station
                    'level'
                ),
                pk=score_id
            )
            
            test_session = score.test
            question_paper = test_session.question_paper

            if not question_paper:
                return Response({"error": "Test session is not linked to a question paper."}, status=status.HTTP_404_NOT_FOUND)

            # 2. Get Employee details
            employee = score.employee
            employee_name = f"{employee.first_name} {employee.last_name}" if employee else "N/A"
            current_employee_id = employee.emp_id if employee else "N/A"

            # 3. Get Contextual Names
            qp_name = question_paper.question_paper_name or "N/A"
            dept_name = score.department.department_name if score.department else "N/A"
            station_name = score.skill.station_name if score.skill else "N/A"
            level_name = score.level.level_name if score.level else "N/A"

            # 4. Get all questions for the test paper
            questions_qs = TemplateQuestion.objects.filter(
                question_paper=question_paper
            ).order_by("id")
            
            # 5. Retrieve employee's submitted answers
            employee_submitted_answers = score.raw_answers
            if not isinstance(employee_submitted_answers, list):
                employee_submitted_answers = [] 
                logger.warning("Raw answers not found or invalid type for score ID %s", score.id)

            # 6. Compile the final answer sheet data (with image URLs)
            answer_sheet = []
            
            for i, question in enumerate(questions_qs):
                employee_ans_index = employee_submitted_answers[i] if i < len(employee_submitted_answers) else -1
                
                # List of option TEXTS for finding the correct index
                option_texts = [question.option_a, question.option_b, question.option_c, question.option_d]
                
                # --->>> THIS IS THE CRUCIAL CHANGE <<<---
                # List of option OBJECTS including text and image URLs
                options_with_images = [
                    {"text": question.option_a, "image_url": request.build_absolute_uri(question.option_a_image.url) if question.option_a_image else None},
                    {"text": question.option_b, "image_url": request.build_absolute_uri(question.option_b_image.url) if question.option_b_image else None},
                    {"text": question.option_c, "image_url": request.build_absolute_uri(question.option_c_image.url) if question.option_c_image else None},
                    {"text": question.option_d, "image_url": request.build_absolute_uri(question.option_d_image.url) if question.option_d_image else None},
                ]
                
                # Get the full URL for the main question image
                question_image_url = request.build_absolute_uri(question.question_image.url) if question.question_image else None
                # --->>> END OF CRUCIAL CHANGE <<<---
                
                try:
                    # Find the correct index using the text-only list
                    correct_index = option_texts.index(question.correct_answer)
                except ValueError:
                    correct_index = -2 # Error state

                is_correct = (employee_ans_index == correct_index and employee_ans_index != -1)
                
                answer_sheet.append({
                    "id": question.id,
                    "question_text": question.question,
                    "question_image_url": question_image_url,  # SEND a question image URL
                    "options": options_with_images,             # SEND the list of option objects
                    "correct_index": correct_index,
                    "employee_answer_index": employee_ans_index,
                    "is_correct": is_correct,
                })

            # 7. Prepare Final Response
            response_data = {
                "test_name": test_session.test_name,
                "employee_name": employee_name,
                "employee_id": current_employee_id,
                "question_paper_name": qp_name,
                "department_name": dept_name,
                "station_name": station_name,
                "level_name": level_name,
                "questions": answer_sheet,
                "score_summary": {
                    "total_questions": questions_qs.count(),
                    "correct_answers": score.marks,
                    "score": score.marks,
                    "percentage": score.percentage,
                    "passed": score.passed,
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Score.DoesNotExist:
            return Response({"error": f"Score entry with ID {score_id} not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error("Error in AnswerSheetView (ID: %s): %s", score_id, str(e), exc_info=True)
            return Response({"error": "An unexpected error occurred while generating the answer sheet."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





class LevelStationMatrixView(APIView):
    """
    Returns a matrix view of all employee results for a specific Level and Station (Skill).
    URL: /api/results/matrix/<int:level_id>/<int:station_id>/
    """
    def get(self, request, level_id, station_id):
        try:
            logger.info("LevelStationMatrixView called for Level %d, Station %d", level_id, station_id)

            # 1. Find the Question Paper corresponding to the Level and Station
            # Assuming QuestionPaper model links directly to Level and Station/Skill
            qp = QuestionPaper.objects.filter(
                level_id=level_id, 
                station_id=station_id
            ).first()

            if not qp:
                return Response({"error": "No Question Paper found for this Level and Station."}, status=status.HTTP_404_NOT_FOUND)

            # 2. Get all questions for the paper (to form the columns)
            questions_qs = TemplateQuestion.objects.filter(
                question_paper=qp
            ).order_by("id")
            
            # Map questions to column headers
            question_headers = [{
                "id": q.id,
                "text_preview": q.question[:50] + "...",
                "correct_index": options.index(q.correct_answer) if q.correct_answer in (options := [q.option_a, q.option_b, q.option_c, q.option_d]) else -1
            } for q in questions_qs]

            # 3. Get all Score records linked to this Question Paper
            # Filter scores using the TestSession which links to the QP
            all_scores = Score.objects.select_related(
                'employee', 'test'
            ).filter(
                test__question_paper=qp
            )
            
            # 4. Compile the Matrix Rows (Employee Results)
            employee_results = []
            for score in all_scores:
                employee = score.employee
                raw_answers = score.raw_answers
                
                # Normalize raw answers list (must match the number of questions)
                submitted_answers = raw_answers if isinstance(raw_answers, list) else []
                
                # Check performance per question
                q_results = []
                for i, q_header in enumerate(question_headers):
                    employee_ans_index = submitted_answers[i] if i < len(submitted_answers) else -1
                    correct_index = q_header['correct_index']
                    
                    is_correct = (employee_ans_index == correct_index and employee_ans_index != -1)
                    
                    q_results.append({
                        "is_correct": is_correct,
                        "submitted_ans_index": employee_ans_index,
                    })

                employee_results.append({
                    "employee_id": employee.emp_id,
                    "employee_name": f"{employee.first_name} {employee.last_name}",
                    "score_id": score.pk, # Link back to individual answer sheet
                    "overall_marks": score.marks,
                    "overall_percentage": score.percentage,
                    "question_results": q_results
                })

            # 5. Final Response
            response_data = {
                "level_id": level_id,
                "station_id": station_id,
                "question_paper_name": qp.question_paper_name,
                "question_headers": question_headers,
                "employee_results": employee_results
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error("Error in LevelStationMatrixView: %s", str(e))
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            





# import openpyxl
# import re
# from datetime import date
# from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
# from openpyxl.utils import get_column_letter
# from io import BytesIO

# from django.http import HttpResponse
# from django.db import transaction
# from rest_framework import status
# from rest_framework.views import APIView
# from rest_framework.response import Response

# from .models import HierarchyStructure, SkillMatrix, Level, Department, Line, SubLine

# class SkillMatrixExcelHandlerView(APIView):
#     """
#     Handles the download and upload of a matrix-style Excel template.
#     Uses hidden IDs for robust data lookup.
#     """

#     def get(self, request, *args, **kwargs):
#         # This GET method is correct and does not need changes.
#         # It's included here so you can copy the entire class.
#         department_id = request.query_params.get('department')
#         line_id = request.query_params.get('line')
#         # ... (rest of GET method is unchanged from the last correct version) ...
#         subline_id = request.query_params.get('subline')

#         if not department_id:
#             return Response({"error": "Department ID is required."}, status=status.HTTP_400_BAD_REQUEST)

#         filters = {'department_id': department_id}
#         if line_id:
#             filters['line_id'] = line_id
#         if subline_id:
#             filters['subline_id'] = subline_id
        
#         hierarchy_nodes = HierarchyStructure.objects.filter(**filters).select_related(
#             'station', 'department', 'line'
#         ).order_by('station__station_name')

#         if not hierarchy_nodes.exists():
#             return Response({"error": "No stations found for the selected hierarchy."}, status=status.HTTP_404_NOT_FOUND)

#         first_node = hierarchy_nodes.first()
#         department_name = first_node.department.department_name
#         line_name = first_node.line.line_name if first_node.line else "All Lines"
#         actual_line_id = first_node.line.line_id if first_node.line else "" # Assuming line_id
#         stations = [node.station for node in hierarchy_nodes if node.station]

#         wb = openpyxl.Workbook()
#         ws_data = wb.active
#         ws_data.title = "Data_Upload"
#         ws_inst = wb.create_sheet("Instructions")

#         header_font = Font(bold=True, color="FFFFFF")
#         header_fill = PatternFill(start_color="4F81BD", end_color="4F81BD", fill_type="solid")
#         info_font = Font(bold=True)
#         center_align = Alignment(horizontal='center', vertical='center', wrap_text=True)
#         thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

#         ws_data.merge_cells('A1:B1')
#         ws_data['A1'] = 'Department:'
#         ws_data['A1'].font = info_font
#         ws_data.merge_cells('C1:E1')
#         ws_data['C1'] = department_name

#         ws_data.merge_cells('A2:B2')
#         ws_data['A2'] = 'Line:'
#         ws_data['A2'].font = info_font
#         ws_data.merge_cells('C2:E2')
#         ws_data['C2'] = line_name

#         ws_data['A3'] = "department_id"
#         ws_data['B3'] = department_id
#         ws_data['A4'] = "line_id"
#         ws_data['B4'] = actual_line_id
#         ws_data.row_dimensions[3].hidden = True
#         ws_data.row_dimensions[4].hidden = True

#         HEADER_ROW = 5
#         main_headers = ["S.No", "Operator Name", "Employee ID", "Date of Joining (DD/MM/YYYY)"]
#         station_headers = [station.station_name for station in stations]
#         full_headers = main_headers + station_headers
        
#         ws_data.row_dimensions[HEADER_ROW].height = 40
#         for col_num, header_title in enumerate(full_headers, 1):
#             cell = ws_data.cell(row=HEADER_ROW, column=col_num, value=header_title)
#             cell.font = header_font
#             cell.fill = header_fill
#             cell.alignment = center_align
#             cell.border = thin_border
        
#         DUMMY_DATA_START_ROW = 6
#         dummy_data = [
#             (1, "Sahil", "00100022", date(2025, 1, 6)),
#             (2, "Navinder Singh", "00100035", date(2025, 1, 21)),
#         ]
        
#         current_data_row = DUMMY_DATA_START_ROW
#         for s_no, name, emp_id, doj in dummy_data:
#             ws_data.cell(row=current_data_row, column=1, value=s_no)
#             ws_data.cell(row=current_data_row, column=2, value=name)
#             ws_data.cell(row=current_data_row, column=3, value=emp_id)
#             ws_data.cell(row=current_data_row, column=4, value=doj).number_format = 'DD/MM/YYYY'
#             current_data_row += 1
            
#         if len(stations) > 1:
#             ws_data.cell(row=DUMMY_DATA_START_ROW, column=5, value="Level 4")
#             ws_data.cell(row=DUMMY_DATA_START_ROW, column=6, value="Level 2")

#         virtual_workbook = BytesIO()
#         wb.save(virtual_workbook)
#         virtual_workbook.seek(0)
#         response = HttpResponse(
#             virtual_workbook.read(),
#             content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
#         )
#         response['Content-Disposition'] = 'attachment; filename="SkillMatrix_Template_Robust.xlsx"'
#         return response

#     @transaction.atomic
#     def post(self, request, *args, **kwargs):
#         excel_file = request.FILES.get('file')
#         if not excel_file:
#             return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             wb = openpyxl.load_workbook(excel_file, data_only=True)
#             ws = wb["Data_Upload"]
#         except Exception:
#             return Response({"error": "Could not open the Excel file or find 'Data_Upload' sheet."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             department_id = ws['B3'].value
#             line_id = ws['B4'].value
#             department_name = ws['C1'].value
#             HEADER_ROW = 5
#             headers = [cell.value for cell in ws[HEADER_ROW]]
#             station_headers = headers[4:]

#             if not department_id:
#                 return Response({"error": "Template is corrupt. Department ID is missing."}, status=status.HTTP_400_BAD_REQUEST)
        
#         except Exception:
#             return Response({"error": "Could not parse header information. The template might be corrupt."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             department = Department.objects.get(department_id=department_id)
#             line = Line.objects.get(line_id=line_id) if line_id else None

#             hierarchy_filter = {'department': department}
#             if line:
#                 hierarchy_filter['line'] = line

#             hierarchy_map = {
#                 h.station.station_name: h for h in HierarchyStructure.objects.filter(
#                     **hierarchy_filter
#                 ).select_related('station')
#             }
#             # This map correctly gets the Level object for each "Level X" string
#             level_map = {level.level_name: level for level in Level.objects.all()}

#         except Department.DoesNotExist:
#             return Response({"error": f"Department with ID '{department_id}' not found in the database."}, status=status.HTTP_400_BAD_REQUEST)
#         except Line.DoesNotExist:
#              return Response({"error": f"Line with ID '{line_id}' not found for Department '{department_name}'."}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response({"error": f"An unexpected error occurred during database lookup: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         errors = []
#         successful_uploads = 0
        
#         DATA_START_ROW = 6
#         for row_idx, row in enumerate(ws.iter_rows(min_row=DATA_START_ROW, values_only=True), start=DATA_START_ROW):
#             emp_name = row[1]
#             emp_id_from_excel = row[2]
#             doj = row[3]

#             if not emp_id_from_excel or not emp_name:
#                 continue


#             try:
#                 # Assuming your MasterTable has a field named 'emp_id' to look up against. Adjust if necessary.
#                 employee_obj = MasterTable.objects.get(emp_id=str(emp_id_from_excel).strip())
#             except MasterTable.DoesNotExist:
#                 errors.append(f"Row {row_idx}: Employee with ID '{emp_id_from_excel}' not found in the MasterTable. Please add them first.")
#                 continue # Skip all skills for this non-existent employee

#             for col_idx, skill_level_raw in enumerate(row[4:]):
#                 if not skill_level_raw:
#                     continue

#                 level_num_match = re.search(r'\d+', str(skill_level_raw))
#                 if not level_num_match:
#                     errors.append(f"Row {row_idx}: Invalid level format '{skill_level_raw}'. Please use 'Level X' or 'X'.")
#                     continue
                
#                 level_num = int(level_num_match.group(0))
#                 level_search_key = f"Level {level_num}"
                
#                 if level_search_key not in level_map:
#                     errors.append(f"Row {row_idx}: '{level_search_key}' is not a valid skill level in the database.")
#                     continue
                
#                 station_name = station_headers[col_idx]
#                 hierarchy_obj = hierarchy_map.get(station_name)
                
#                 if not hierarchy_obj:
#                     errors.append(f"Row {row_idx}: Station '{station_name}' could not be matched for the selected hierarchy.")
#                     continue
                
#                 try:
#                     SkillMatrix.objects.update_or_create(
#                         # 1. Use the correct lookup keys based on your model
#                         hierarchy=hierarchy_obj,
#                         employee=employee_obj,
                        
#                         # 2. Provide ALL other fields in the defaults dictionary
#                         defaults={
#                             'employee_name': str(emp_name).strip(),
#                             'emp_id': str(emp_id_from_excel).strip(),
#                             'doj': doj,
#                             'level': level_map[level_search_key]
#                         }
#                     )
#                     successful_uploads += 1
#                 except Exception as e:
#                     # --- FIX #2: Print the REAL exception 'e' for proper debugging ---
#                     errors.append(f"Row {row_idx}: Could not save data for Emp ID {emp_id} at Station {station_name}. Error: {e}")

#         if errors:
#             error_message = f"Processed {successful_uploads} records. However, {len(errors)} errors occurred."
#             return Response({"status": error_message, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        
#         return Response({"status": f"Successfully uploaded/updated {successful_uploads} skill matrix records!"}, status=status.HTTP_201_CREATED)









import openpyxl
import re
from datetime import date
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from io import BytesIO

from django.http import HttpResponse
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

# Make sure you import your models correctly. Using placeholders for this example.
from .models import HierarchyStructure, SkillMatrix, Level, Department, Line, SubLine, MasterTable

class SkillMatrixExcelHandlerView(APIView):
    """
    Handles the download and upload of a matrix-style Excel template.
    Uses hidden IDs for robust data lookup.
    """

    def get(self, request, *args, **kwargs):
        department_id = request.query_params.get('department')
        line_id = request.query_params.get('line')
        subline_id = request.query_params.get('subline')

        if not department_id:
            return Response({"error": "Department ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        filters = {'department_id': department_id}
        if line_id:
            filters['line_id'] = line_id
        if subline_id:
            filters['subline_id'] = subline_id
        
        hierarchy_nodes = HierarchyStructure.objects.filter(**filters).select_related(
            'station', 'department', 'line'
        ).order_by('station__station_name')

        if not hierarchy_nodes.exists():
            return Response({"error": "No stations found for the selected hierarchy."}, status=status.HTTP_404_NOT_FOUND)

        first_node = hierarchy_nodes.first()
        department_name = first_node.department.department_name
        line_name = first_node.line.line_name if first_node.line else "All Lines"
        actual_line_id = first_node.line.line_id if first_node.line else ""
        stations = [node.station for node in hierarchy_nodes if node.station]

        wb = openpyxl.Workbook()
        
        # --- FIX: Create Instructions first, then Data_Upload ---
        ws_inst = wb.active
        ws_inst.title = "Instructions"
        ws_data = wb.create_sheet("Data_Upload")

        # Define common styles
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="4F81BD", end_color="4F81BD", fill_type="solid")
        info_font = Font(bold=True)
        center_align = Alignment(horizontal='center', vertical='center', wrap_text=True)
        thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

        # --- FIX: Add content to the Instructions sheet ---
        ws_inst['A1'] = "Instructions for Use"
        ws_inst['A1'].font = Font(bold=True, size=14)
        ws_inst.merge_cells('A1:C1')

        ws_inst['A3'] = "Step"
        ws_inst['A3'].font = header_font
        ws_inst['A3'].fill = header_fill
        ws_inst['B3'] = "Description"
        ws_inst['B3'].font = header_font
        ws_inst['B3'].fill = header_fill
        
        instructions_data = [
            ("1. Context", f"This template is for uploading skills for Department: '{department_name}' and Line: '{line_name}'."),
            ("2. Go to Sheet", "After reading these instructions, please switch to the 'Data_Upload' sheet to enter your data."),
            ("3. Do Not Change", "In 'Data_Upload', do not modify the headers in Row 5 or the hidden IDs in Rows 3 and 4. They are required for the upload to work correctly."),
            ("4. Fill Data", "Fill in the operator details and their skill levels for each station shown in the columns."),
            ("   - Employee ID", "This ID MUST match an existing employee in the master database. New employees cannot be added via this sheet."),
            ("   - Date of Joining", "Use the format DD/MM/YYYY."),
            ("   - Station Columns", "For each station, enter the skill level (e.g., 'Level 1', 'Level 2'). Leave the cell blank if the operator has no skill for that station."),
            ("5. Sample Data", "The first few rows in 'Data_Upload' contain sample data to show the correct format. Please DELETE these rows before entering your own data."),
            ("6. Upload", "Save the file and upload it using the 'Upload Excel' button in the application.")
        ]
        
        current_inst_row = 4
        for step, desc in instructions_data:
            cell_a = ws_inst.cell(row=current_inst_row, column=1, value=step)
            cell_b = ws_inst.cell(row=current_inst_row, column=2, value=desc)
            cell_a.font = Font(bold=True)
            cell_b.alignment = Alignment(wrap_text=True, vertical='top')
            current_inst_row += 1

        ws_inst.column_dimensions['A'].width = 20
        ws_inst.column_dimensions['B'].width = 80
        # --- END of Instructions content ---

        # --- Populate the Data_Upload sheet (ws_data) ---
        ws_data.merge_cells('A1:B1')
        ws_data['A1'] = 'Department:'
        ws_data['A1'].font = info_font
        ws_data.merge_cells('C1:E1')
        ws_data['C1'] = department_name

        ws_data.merge_cells('A2:B2')
        ws_data['A2'] = 'Line:'
        ws_data['A2'].font = info_font
        ws_data.merge_cells('C2:E2')
        ws_data['C2'] = line_name

        ws_data['A3'] = "department_id"
        ws_data['B3'] = department_id
        ws_data['A4'] = "line_id"
        ws_data['B4'] = actual_line_id
        ws_data.row_dimensions[3].hidden = True
        ws_data.row_dimensions[4].hidden = True

        HEADER_ROW = 5
        main_headers = ["S.No", "Operator Name", "Employee ID", "Date of Joining (DD/MM/YYYY)"]
        station_headers = [station.station_name for station in stations]
        full_headers = main_headers + station_headers
        
        ws_data.row_dimensions[HEADER_ROW].height = 40
        for col_num, header_title in enumerate(full_headers, 1):
            cell = ws_data.cell(row=HEADER_ROW, column=col_num, value=header_title)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center_align
            cell.border = thin_border
        
        DUMMY_DATA_START_ROW = 6
        dummy_data = [
            (1, "Sahil", "00100022", date(2025, 1, 6)),
            (2, "Navinder Singh", "00100035", date(2025, 1, 21)),
        ]
        
        current_data_row = DUMMY_DATA_START_ROW
        for s_no, name, emp_id, doj in dummy_data:
            ws_data.cell(row=current_data_row, column=1, value=s_no)
            ws_data.cell(row=current_data_row, column=2, value=name)
            ws_data.cell(row=current_data_row, column=3, value=emp_id)
            ws_data.cell(row=current_data_row, column=4, value=doj).number_format = 'DD/MM/YYYY'
            current_data_row += 1
            
        if len(stations) > 1:
            ws_data.cell(row=DUMMY_DATA_START_ROW, column=5, value="Level 4")
            ws_data.cell(row=DUMMY_DATA_START_ROW, column=6, value="Level 2")

        # --- FIX: Set the active sheet to be Data_Upload on open ---
        wb.active = ws_data

        virtual_workbook = BytesIO()
        wb.save(virtual_workbook)
        virtual_workbook.seek(0)
        response = HttpResponse(
            virtual_workbook.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename="SkillMatrix_Template_Robust.xlsx"'
        return response

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        excel_file = request.FILES.get('file')
        if not excel_file:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            wb = openpyxl.load_workbook(excel_file, data_only=True)
            ws = wb["Data_Upload"]
        except Exception:
            return Response({"error": "Could not open the Excel file or find 'Data_Upload' sheet."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            department_id = ws['B3'].value
            line_id = ws['B4'].value
            department_name = ws['C1'].value # Used for error messages
            HEADER_ROW = 5
            headers = [cell.value for cell in ws[HEADER_ROW]]
            station_headers = headers[4:]

            if not department_id:
                return Response({"error": "Template is corrupt. Department ID is missing."}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception:
            return Response({"error": "Could not parse header information. The template might be corrupt."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            department = Department.objects.get(department_id=department_id)
            line = Line.objects.get(line_id=line_id) if line_id else None

            hierarchy_filter = {'department': department}
            if line:
                hierarchy_filter['line'] = line

            hierarchy_map = {
                h.station.station_name: h for h in HierarchyStructure.objects.filter(
                    **hierarchy_filter
                ).select_related('station')
            }
            level_map = {level.level_name: level for level in Level.objects.all()}

        except Department.DoesNotExist:
            return Response({"error": f"Department with ID '{department_id}' not found in the database."}, status=status.HTTP_400_BAD_REQUEST)
        except Line.DoesNotExist:
             return Response({"error": f"Line with ID '{line_id}' not found for Department '{department_name}'."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred during database lookup: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        errors = []
        successful_uploads = 0
        
        DATA_START_ROW = 6
        for row_idx, row in enumerate(ws.iter_rows(min_row=DATA_START_ROW, values_only=True), start=DATA_START_ROW):
            emp_name = row[1]
            emp_id_from_excel = row[2]
            doj = row[3]

            if not emp_id_from_excel or not emp_name:
                continue

            try:
                employee_obj = MasterTable.objects.get(emp_id=str(emp_id_from_excel).strip())
            except MasterTable.DoesNotExist:
                errors.append(f"Row {row_idx}: Employee with ID '{emp_id_from_excel}' not found in the MasterTable. Please add them first.")
                continue

            for col_idx, skill_level_raw in enumerate(row[4:]):
                if not skill_level_raw:
                    continue

                level_num_match = re.search(r'\d+', str(skill_level_raw))
                if not level_num_match:
                    errors.append(f"Row {row_idx}: Invalid level format '{skill_level_raw}' for station '{station_headers[col_idx]}'. Please use 'Level X' or 'X'.")
                    continue
                
                level_num = int(level_num_match.group(0))
                level_search_key = f"Level {level_num}"
                
                if level_search_key not in level_map:
                    errors.append(f"Row {row_idx}: '{level_search_key}' is not a valid skill level in the database.")
                    continue
                
                station_name = station_headers[col_idx]
                hierarchy_obj = hierarchy_map.get(station_name)
                
                if not hierarchy_obj:
                    errors.append(f"Row {row_idx}: Station '{station_name}' could not be matched for the selected hierarchy.")
                    continue
                
                try:
                    SkillMatrix.objects.update_or_create(
                        hierarchy=hierarchy_obj,
                        employee=employee_obj,
                        defaults={
                            'employee_name': str(emp_name).strip(),
                            'emp_id': str(emp_id_from_excel).strip(),
                            'doj': doj,
                            'level': level_map[level_search_key]
                        }
                    )
                    successful_uploads += 1
                except Exception as e:
                    errors.append(f"Row {row_idx}: Could not save data for Emp ID {emp_id_from_excel} at Station {station_name}. Error: {e}")

        if errors:
            error_message = f"Processed {successful_uploads} records. However, {len(errors)} errors occurred."
            return Response({"status": error_message, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"status": f"Successfully uploaded/updated {successful_uploads} skill matrix records!"}, status=status.HTTP_201_CREATED)







class SpecificHierarchyExcelHandlerView(APIView):
    """
    Handles downloading a context-specific template and uploading skill matrix data
    for a single, pre-defined HierarchyStructure.
    """
    parser_classes = [MultiPartParser]

    def get(self, request, hierarchy_id, *args, **kwargs):
        """Generates a simplified Excel template for a specific hierarchy."""
        try:
            hierarchy = HierarchyStructure.objects.select_related('station', 'department').get(pk=hierarchy_id)
        except HierarchyStructure.DoesNotExist:
            return Response({'error': 'Hierarchy not found.'}, status=status.HTTP_404_NOT_FOUND)

        station_name = hierarchy.station.station_name
        department_name = hierarchy.department.department_name
        filename = f"skill_matrix_{department_name}_{station_name}.xlsx".replace(" ", "_")

        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Instructions Sheet
            instructions_data = {
                "Instruction": ["Context:", "Columns:", "emp_id", "employee_name", "doj", "level_name", "Note:"],
                "Description": [
                    f"This template is for uploading skills for Department: '{department_name}' and Station: '{station_name}'.",
                    "Fill in the 'Data_Upload' sheet. Do not change the column headers.",
                    "The unique Employee ID (e.g., E1001).",
                    "The full name of the employee.",
                    "Date of Joining in YYYY-MM-DD format.",
                    "The name of the skill level (e.g., 'Level 1').",
                    "Please delete the sample rows before entering your own data."
                ]
            }
            pd.DataFrame(instructions_data).to_excel(writer, sheet_name='Instructions', index=False)

            # Data Upload Sheet (Simplified)
            sample_data = {
                'emp_id': ['E1001', 'E1002'], 'employee_name': ['John Doe', 'Jane Smith'],
                'doj': ['2023-01-15', '2022-11-20'], 'level_name': ['Level 1', 'Level 2']
            }
            pd.DataFrame(sample_data).to_excel(writer, sheet_name='Data_Upload', index=False)
        
        output.seek(0)
        response = HttpResponse(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    def post(self, request, hierarchy_id, *args, **kwargs):
        """Uploads skill matrix data for a specific hierarchy."""
        try:
            hierarchy = HierarchyStructure.objects.get(pk=hierarchy_id)
        except HierarchyStructure.DoesNotExist:
            return Response({'error': 'Hierarchy not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        file_obj = request.data.get('file')
        if not file_obj:
            return Response({'error': 'Excel file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file_obj, sheet_name='Data_Upload')
        except Exception as e:
            return Response({'error': f"Error reading Excel file: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        skill_matrices_to_create = []
        errors = []
        with transaction.atomic():
            for index, row in df.iterrows():
                row_num = index + 2
                try:
                    emp_id = str(row['emp_id']).strip()
                    level_name = str(row['level_name']).strip()
                    
                    employee = MasterTable.objects.get(emp_id=emp_id)
                    level = Level.objects.get(level_name=level_name)
                    
                    # The KEY CHANGE: Use the pre-fetched hierarchy for every row
                    skill_matrices_to_create.append(
                        SkillMatrix(
                            employee=employee, employee_name=row['employee_name'],
                            emp_id=emp_id, doj=row['doj'], level=level,
                            hierarchy=hierarchy # Use the hierarchy from the URL
                        )
                    )
                except MasterTable.DoesNotExist:
                    errors.append(f"Row {row_num}: Employee with emp_id '{emp_id}' not found.")
                except Level.DoesNotExist:
                    errors.append(f"Row {row_num}: Level with name '{level_name}' not found.")
                except KeyError as e:
                    errors.append(f"Row {row_num}: Missing required column: {str(e)}.")
                except Exception as e:
                    errors.append(f"Row {row_num}: An unexpected error occurred: {str(e)}.")

            if errors:
                return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

            SkillMatrix.objects.bulk_create(skill_matrices_to_create)

        return Response({'status': f'{len(skill_matrices_to_create)} records created for {hierarchy}.'}, status=status.HTTP_201_CREATED)






from django.http import HttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from io import BytesIO
import json
import traceback
from collections import defaultdict
from .models import (
    MasterTable, SkillMatrix, Station, SubLine, 
    HierarchyStructure, Department, Line, StationManager
)
from datetime import datetime
@method_decorator(csrf_exempt, name='dispatch')
class SkillMatrixExcelView(View):
    def post(self, request, *args, **kwargs):
        """
        Generate Skill Matrix Excel Report with actual data
        Accepts filters for department, main_line, sub_line
        """
        try:
            print("\n=== Received Skill Matrix Excel generation request ===")
            
            # 1. Parse input data
            filters = self._get_filters(request)
            print(f"Processing filters: {filters}")

            # 2. Get filtered data
            skill_matrix_data = self._get_skill_matrix_data(filters)
            if not skill_matrix_data['operators']:
                return JsonResponse({'error': 'No operators found for the given criteria'}, status=404)

            # 3. Generate Excel content
            print("Generating Skill Matrix Excel content...")
            buffer = BytesIO()
            
            # Create workbook and worksheet
            wb = Workbook()
            ws = wb.active
            ws.title = "Skill Matrix Report"
            
            self.create_skill_matrix_content(ws, skill_matrix_data, filters)
            
            # 4. Save to buffer
            print("Building Skill Matrix Excel document...")
            wb.save(buffer)
            buffer.seek(0)
            print("Skill Matrix Excel generation completed successfully")

            # 5. Return Excel response
            response = HttpResponse(
                buffer.getvalue(), 
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            
            # Create filename based on filters
            filename = self._generate_filename(filters)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            print("\n!!! Skill Matrix Excel generation failed !!!")
            traceback.print_exc()
            return JsonResponse(
                {
                    'error': 'Internal server error',
                    'detail': str(e),
                    'traceback': traceback.format_exc()
                }, 
                status=500
            )
    def _get_filters(self, request):
        """Helper method to extract and validate filters from request"""
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                filters = {
                    'department_id': data.get('department_id'),
                    'line_id': data.get('line_id'),
                    'sub_line_id': data.get('sub_line_id'),
                    'station_requirements': data.get('station_requirements', []),
                }
            except json.JSONDecodeError:
                filters = {}
        else:
            filters = {
                'department_id': request.POST.get('department_id'),
                'line_id': request.POST.get('line_id'),
                'sub_line_id': request.POST.get('sub_line_id'),
                'station_requirements': [],
            }
        
        # Convert filter values to integers and validate
        for key in ['department_id', 'line_id', 'sub_line_id']:
            if filters.get(key):
                try:
                    # Ensure we convert to int and handle any object types
                    value = filters[key]
                    # If it's already an object with an ID attribute, extract it
                    if hasattr(value, 'department_id'):
                        filters[key] = int(value.department_id)
                    elif hasattr(value, 'line_id'):
                        filters[key] = int(value.line_id)
                    elif hasattr(value, 'subline_id'):
                        filters[key] = int(value.subline_id)
                    else:
                        filters[key] = int(value)
                except (ValueError, TypeError, AttributeError) as e:
                    print(f"Invalid {key}: {filters[key]}, Error: {str(e)}")
                    filters[key] = None
        
        print(f"Validated filters: {filters}")
        return filters

    def _get_skill_matrix_data(self, filters):
        """Get organized skill matrix data based on filters"""
        
        # Build query filters for hierarchy structures - ensure we use integer IDs
        hierarchy_filters = {}
        if filters.get('sub_line_id'):
            subline_id = int(filters['sub_line_id']) if filters['sub_line_id'] else None
            if subline_id:
                hierarchy_filters['subline_id'] = subline_id
        elif filters.get('line_id'):
            line_id = int(filters['line_id']) if filters['line_id'] else None
            if line_id:
                hierarchy_filters['line_id'] = line_id
        elif filters.get('department_id'):
            dept_id = int(filters['department_id']) if filters['department_id'] else None
            if dept_id:
                hierarchy_filters['department_id'] = dept_id

        print(f"Applying hierarchy_filters: {hierarchy_filters}")

        # Get hierarchies based on filters, only include entries with a station
        hierarchies = HierarchyStructure.objects.filter(
            **hierarchy_filters,
            station__isnull=False
        ).select_related(
            'station'
        ).order_by('station__station_name')

        print(f"Hierarchies found: {hierarchies.count()} records")
        
        # Debug: Print each hierarchy's station info
        for h in hierarchies:
            print(f"  Hierarchy {h.structure_id}: station={h.station}, station_id={h.station_id}, type={type(h.station)}")

        # Extract unique stations - FIXED: ensure we only get Station objects
        stations = []
        seen_station_ids = set()
        
        for h in hierarchies:
            if h.station and h.station_id and h.station_id not in seen_station_ids:
                from .models import Station
                if isinstance(h.station, Station):
                    stations.append(h.station)
                    seen_station_ids.add(h.station_id)
                else:
                    print(f"WARNING: h.station is not a Station instance: {type(h.station)} - {h.station}")

        print(f"Extracted {len(stations)} unique stations")
        
        if not stations:
            return {'operators': [], 'stations': [], 'matrix': {}, 'station_managers': {}, 'hierarchy_info': {}}

        # Prefetch StationManager data - use station IDs instead of objects
        station_ids = [s.station_id for s in stations]
        station_managers = StationManager.objects.filter(station_id__in=station_ids).select_related('station')
        station_manager_map = {sm.station_id: sm for sm in station_managers}

        # Merge with station_requirements from filters if provided
        if filters.get('station_requirements'):
            for req in filters['station_requirements']:
                station_id = req.get('station_id')
                if station_id:
                    if station_id in station_manager_map:
                        # Update existing
                        sm = station_manager_map[station_id]
                        if 'minimum_level_required' in req:
                            sm.minimum_level_required = req['minimum_level_required']
                        if 'minimum_operators' in req:
                            sm.minimum_operators = req['minimum_operators']
                    else:
                        # Add new
                        station_manager_map[station_id] = type('StationManager', (), {
                            'station_id': station_id,
                            'minimum_level_required': req.get('minimum_level_required', 'N/A'),
                            'minimum_operators': req.get('minimum_operators', 'N/A'),
                        })()

        # Get skill matrix entries for filtered hierarchies
        skill_matrices = SkillMatrix.objects.filter(
            hierarchy__in=hierarchies
        ).select_related('employee', 'hierarchy__station', 'level').order_by('employee__first_name')
        
        print(f"Skill matrices found: {skill_matrices.count()} records")
        
        # Debug: Check if there are ANY skill matrices in the system
        total_skill_matrices = SkillMatrix.objects.count()
        print(f"Total skill matrices in database: {total_skill_matrices}")
        
        # Debug: Check hierarchy IDs being queried
        hierarchy_ids = [h.structure_id for h in hierarchies]
        print(f"Searching for skill matrices with hierarchy IDs: {hierarchy_ids}")

        # Build matrix data structure
        operators = list(set([skill.employee for skill in skill_matrices]))
        operators.sort(key=lambda x: x.first_name)
        
        print(f"Unique operators found: {len(operators)}")

        # Create skill matrix
        matrix = defaultdict(dict)
        for skill in skill_matrices:
            station = skill.hierarchy.station
            if station:
                matrix[skill.emp_id][station.station_name] = {
                    'skill_level': skill.level.level_name if hasattr(skill.level, 'level_name') else str(skill.level),
                    'sequence': 0,
                    'updated_at': skill.updated_at  # Added updated_at field
                }

        return {
            'operators': operators,
            'stations': stations,
            'matrix': dict(matrix),
            'station_managers': station_manager_map,
            'hierarchy_info': self._get_hierarchy_info(filters)
        }
    def _get_hierarchy_info(self, filters):
        """Get hierarchy information for report header"""
        info = {}
        
        if filters.get('department_id'):
            try:
                department = Department.objects.filter(department_id=filters['department_id']).first()
                if department:
                    info['department'] = department.department_name
                else:
                    print(f"No Department found for department_id: {filters['department_id']}")
            except Exception as e:
                print(f"Error retrieving department name: {str(e)}")
                pass
                
        if filters.get('line_id'):
            try:
                line = Line.objects.filter(line_id=filters['line_id']).first()
                if line:
                    info['line'] = line.line_name
                    if not info.get('department') and line.department_id:
                        department = Department.objects.filter(department_id=line.department_id).first()
                        if department:
                            info['department'] = department.department_name
                else:
                    print(f"No Line found for line_id: {filters['line_id']}")
            except Exception as e:
                print(f"Error retrieving line name: {str(e)}")
                pass
                
        if filters.get('sub_line_id'):
            try:
                subline = SubLine.objects.filter(subline_id=filters['sub_line_id']).first()
                if subline:
                    info['sub_line'] = subline.subline_name
                    if not info.get('line') and subline.line_id:
                        line = Line.objects.filter(line_id=subline.line_id).first()
                        if line:
                            info['line'] = line.line_name
                            if not info.get('department') and line.department_id:
                                department = Department.objects.filter(department_id=line.department_id).first()
                                if department:
                                    info['department'] = department.department_name
                else:
                    print(f"No SubLine found for sub_line_id: {filters['sub_line_id']}")
            except Exception as e:
                print(f"Error retrieving subline name: {str(e)}")
                pass
                
        return info

    def _generate_filename(self, filters):
        """Generate appropriate filename based on filters"""
        parts = ["skill_matrix"]
        
        if filters.get('sub_line_id'):
            parts.append("sub_line")
        elif filters.get('line_id'):
            parts.append("main_line")
        elif filters.get('department_id'):
            parts.append("department")
        else:
            parts.append("all")
            
        return f"{'_'.join(parts)}_report.xlsx"

    def _is_qualified(self, skill_level, min_required):
        """Determine if a skill level is considered qualified based on minimum required"""
        skill_levels = {'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'Level 4': 4}
        min_level_map = {
            'Beginner': 'Level 1',
            'Intermediate': 'Level 2',
            'Advanced': 'Level 3',
            'Expert': 'Level 4'
        }
        current_level = skill_levels.get(skill_level, 0)
        if min_required == "N/A":
            return False
        normalized_min = min_level_map.get(min_required, min_required)
        min_level = skill_levels.get(normalized_min, 0)
        return current_level >= min_level

    def create_skill_matrix_content(self, ws, data, filters):
        """Generate the Excel content structure for skill matrix"""
        current_row = 1
        
        # Title with hierarchy information
        title_parts = ["Skill Matrix Report"]
        hierarchy = data['hierarchy_info']
        
        if hierarchy.get('department'):
            title_parts.append(f"Department: {hierarchy['department']}")
        if hierarchy.get('line'):
            title_parts.append(f"Line: {hierarchy['line']}")
        if hierarchy.get('sub_line'):
            title_parts.append(f"Sub-Line: {hierarchy['sub_line']}")
            
        # Add title
        ws.merge_cells(f'A{current_row}:E{current_row}')
        title_cell = ws[f'A{current_row}']
        title_cell.value = " - ".join(title_parts)
        title_cell.font = Font(size=16, bold=True, color='2E4D6B')
        title_cell.alignment = Alignment(horizontal='center')
        current_row += 2
        
        # Summary section
        current_row = self._add_summary_section(ws, data, current_row)
        current_row += 2
        
        # Main skill matrix table
        current_row = self._add_skill_matrix_table(ws, data, current_row)
        current_row += 2
        
        # Legend
        self._add_legend(ws, current_row)
        
        # Auto-adjust column widths
        self._adjust_column_widths_report(ws)

    def _add_summary_section(self, ws, data, start_row):
        """Add summary statistics section"""
        # Section title
        ws[f'A{start_row}'].value = "Summary Statistics"
        ws[f'A{start_row}'].font = Font(size=12, bold=True)
        start_row += 1
        
        total_operators = len(data['operators'])
        total_stations = len(data['stations'])
        
        # Calculate qualification statistics
        qualified_counts = defaultdict(int)
        for operator in data['operators']:
            operator_skills = data['matrix'].get(operator.emp_id, {})
            for station_name, skill_info in operator_skills.items():
                level = skill_info['skill_level']
                if self._is_qualified(level, 'Level 1'):
                    qualified_counts[level] += 1

        # Summary data
        summary_data = [
            ["Metric", "Count"],
            ["Total Operators", total_operators],
            ["Total Stations", total_stations],
            ["Level 1 Qualifications", qualified_counts.get('Level 1', 0)],
            ["Level 2 Qualifications", qualified_counts.get('Level 2', 0)],
            ["Level 3 Qualifications", qualified_counts.get('Level 3', 0)],
            ["Level 4 Qualifications", qualified_counts.get('Level 4', 0)],
        ]
        
        # Add summary table
        for i, row_data in enumerate(summary_data):
            for j, value in enumerate(row_data):
                cell = ws.cell(row=start_row + i, column=j + 1, value=value)
                
                # Style header row
                if i == 0:
                    cell.font = Font(bold=True, color='FFFFFF')
                    cell.fill = PatternFill(start_color='4682B4', end_color='4682B4', fill_type='solid')
                else:
                    cell.font = Font(size=10)
                
                cell.alignment = Alignment(horizontal='center')
                cell.border = Border(
                    left=Side(style='thin'),
                    right=Side(style='thin'),
                    top=Side(style='thin'),
                    bottom=Side(style='thin')
                )
        
        return start_row + len(summary_data)

    def _add_skill_matrix_table(self, ws, data, start_row):
        """Add the main skill matrix table"""
        # Section title
        ws[f'A{start_row}'].value = "Operator Skill Matrix"
        ws[f'A{start_row}'].font = Font(size=12, bold=True)
        start_row += 1
        
        operators = data['operators']
        stations = data['stations']
        matrix = data['matrix']
        station_managers = data['station_managers']
        
        # Build table headers
        headers = ["S.No", "Operator Name", "Employee ID", "DOJ"]
        
        # Add station headers dynamically based on filtered stations
        for station in stations:
            station_text = f"Station {station.station_name}"
            if hasattr(station, 'skill') and station.skill:
                station_text += f"\n{station.skill}"
            headers.append(station_text)
        
        # Add headers to worksheet
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=start_row, column=col, value=header)
            cell.font = Font(bold=True, color='FFFFFF')
            cell.fill = PatternFill(start_color='4682B4', end_color='4682B4', fill_type='solid')
            cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
            cell.border = Border(
                left=Side(style='thin'),
                right=Side(style='thin'),
                top=Side(style='thin'),
                bottom=Side(style='thin')
            )
        
        # Add minimum skill required row
        min_skill_row = start_row + 1
        ws.cell(row=min_skill_row, column=1, value="Minimum Skill Required")
        ws.cell(row=min_skill_row, column=2, value="")
        ws.cell(row=min_skill_row, column=3, value="")
        ws.cell(row=min_skill_row, column=4, value="")
        for col, station in enumerate(stations, 5):
            station_manager = station_managers.get(station.station_id)
            min_skill = station_manager.minimum_level_required if station_manager else "N/A"
            cell = ws.cell(row=min_skill_row, column=col, value=min_skill)
            cell.alignment = Alignment(horizontal='center')
            cell.border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

        # Add minimum operators required row
        op_required_row = start_row + 2
        ws.cell(row=op_required_row, column=1, value="Station Wise Minimum Operator Required")
        ws.cell(row=op_required_row, column=2, value="")
        ws.cell(row=op_required_row, column=3, value="")
        ws.cell(row=op_required_row, column=4, value="")
        for col, station in enumerate(stations, 5):
            station_manager = station_managers.get(station.station_id)
            min_operators = station_manager.minimum_operators if station_manager else "N/A"
            cell = ws.cell(row=op_required_row, column=col, value=min_operators)
            cell.alignment = Alignment(horizontal='center')
            cell.border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

        # Add data rows
        for idx, operator in enumerate(operators, 1):
            row_num = start_row + 2 + idx
            
            # Basic operator info
            row_data = [
                idx,
                f"{operator.first_name} {operator.last_name}",
                operator.emp_id,
                operator.date_of_joining.strftime('%d/%m/%Y') if operator.date_of_joining else "N/A",
            ]
            
            # Add skill level, qualification status, and updated_at for each station
            operator_skills = matrix.get(operator.emp_id, {})
            for station in stations:
                skill_info = operator_skills.get(station.station_name)
                station_manager = station_managers.get(station.station_id)
                min_required = station_manager.minimum_level_required if station_manager else "N/A"
                if skill_info:
                    level = skill_info['skill_level'].replace('Level ', 'L')
                    qualified = "Qualified" if self._is_qualified(skill_info['skill_level'], min_required) else "Not Qualified"
                    updated_date = skill_info['updated_at'].strftime('%d/%m/%Y') if skill_info['updated_at'] else "N/A"
                    row_data.append(f"{level} ({qualified}, {updated_date})")
                else:
                    row_data.append("-")
            
            # Add row data to worksheet with styling
            for col, value in enumerate(row_data, 1):
                cell = ws.cell(row=row_num, column=col, value=value)
                cell.alignment = Alignment(horizontal='center', vertical='center')
                cell.border = Border(
                    left=Side(style='thin'),
                    right=Side(style='thin'),
                    top=Side(style='thin'),
                    bottom=Side(style='thin')
                )
                
                # Color code skill levels (for station columns)
                if col > 4:  # Station columns (after S.No, Operator Name, Employee ID, DOJ)
                    if "L1" in str(value):
                        cell.font = Font(bold=True, color='FF0000')
                    elif "L2" in str(value):
                        cell.font = Font(bold=True, color='FFA500')
                    elif "L3" in str(value):
                        cell.font = Font(bold=True, color='FFC107')
                    elif "L4" in str(value):
                        cell.font = Font(bold=True, color='008000')
                
                # Zebra striping
                if idx % 2 == 0:
                    cell.fill = PatternFill(start_color='F8F8F8', end_color='F8F8F8', fill_type='solid')
        
        return row_num + 1

    def _add_legend(self, ws, start_row):
        """Add legend for skill levels and symbols"""
        # Section title
        ws[f'A{start_row}'].value = "Legend"
        ws[f'A{start_row}'].font = Font(size=12, bold=True)
        start_row += 1
        
        legend_data = [
            ["Symbol/Code", "Meaning"],
            ["L1 (Qualified)", "Level 1 - Basic (Qualified) "],
            ["L1 (Not Qualified)", "Level 1 - Below Minimum Required "],
            ["L2 (Qualified)", "Level 2 - Intermediate (Qualified) "],
            ["L2 (Not Qualified)", "Level 2 - Below Minimum Required "],
            ["L3 (Qualified)", "Level 3 - Advanced (Qualified) "],
            ["L3 (Not Qualified)", "Level 3 - Below Minimum Required "],
            ["L4 (Qualified)", "Level 4 - Expert (Qualified) "],
            ["L4 (Not Qualified)", "Level 4 - Below Minimum Required "],
            ["-", "No Skill/Not Assigned"],
        ]
        
        # Add legend table
        for i, row_data in enumerate(legend_data):
            for j, value in enumerate(row_data):
                cell = ws.cell(row=start_row + i, column=j + 1, value=value)
                
                # Style header row
                if i == 0:
                    cell.font = Font(bold=True, color='FFFFFF')
                    cell.fill = PatternFill(start_color='666666', end_color='666666', fill_type='solid')
                else:
                    cell.font = Font(size=10)
                    # Apply color to Symbol/Code column (j == 0)
                    if j == 0:
                        if "L1" in value:
                            cell.font = Font(size=10, color='FF0000', bold=True)
                        elif "L2" in value:
                            cell.font = Font(size=10, color='FFA500', bold=True)
                        elif "L3" in value:
                            cell.font = Font(size=10, color='FFC107', bold=True)
                        elif "L4" in value:
                            cell.font = Font(size=10, color='008000', bold=True)
                        elif "-" in value:
                            cell.font = Font(size=10, color='000000', bold=True)
                
                cell.alignment = Alignment(horizontal='left', vertical='center')
                cell.border = Border(
                    left=Side(style='thin'),
                    right=Side(style='thin'),
                    top=Side(style='thin'),
                    bottom=Side(style='thin')
                )

    def _adjust_column_widths_report(self, ws):
        """Auto-adjust column widths based on content"""
        column_widths = {
            'A': 8,   # S.No
            'B': 20,  # Operator Name
            'C': 15,  # Employee ID
            'D': 15,  # DOJ
        }
        
        # Set specific column widths
        for col_letter, width in column_widths.items():
            ws.column_dimensions[col_letter].width = width
        
        # Adjust widths for station columns
        for column in ws.columns:
            if column[0].column > 4:  # Station columns start after DOJ
                max_length = 0
                column_letter = get_column_letter(column[0].column)
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max(max_length + 2, 8), 30)  # Increased max width for longer content
                ws.column_dimensions[column_letter].width = adjusted_width






#================== BiometricAttendance ==================#
from rest_framework import viewsets
from .models import BiometricAttendance
from .serializers import BiometricAttendanceSerializer
from rest_framework.decorators import action
from rest_framework import status


class BiometricAttendanceViewSet(viewsets.ModelViewSet):
    queryset = BiometricAttendance.objects.all()
    serializer_class = BiometricAttendanceSerializer

    @action(detail=False, methods=['delete'], url_path='clear-date')
    def clear_date(self, request):
        date = request.query_params.get('date')
        if not date:
            return Response({'error': 'Date is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count, _ = BiometricAttendance.objects.filter(attendance_date=date).delete()
        return Response({'message': f'Successfully deleted {deleted_count} records for {date}'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], url_path='clear-month')
    def clear_month(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not month or not year:
            return Response({'error': 'Month and Year are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count, _ = BiometricAttendance.objects.filter(
            attendance_date__month=month,
            attendance_date__year=year
        ).delete()
        
        return Response({'message': f'Successfully deleted {deleted_count} records for {month}/{year}'}, status=status.HTTP_200_OK)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from tablib import Dataset
from django.db.models import Count, Sum, Case, When, IntegerField, FloatField
from .models import BiometricAttendance
# --- FIXED IMPORTS ---
from datetime import datetime, time 

class ExcelUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        date_str = request.data.get('date')

        if not file_obj or not date_str:
            return Response({'error': 'File and Date are required'}, status=400)

        file_format = 'xls' if file_obj.name.endswith('.xls') else 'xlsx'
        dataset = Dataset()
        
        try:
            imported_data = dataset.load(file_obj.read(), format=file_format)
        except Exception as e:
            return Response({'error': f'Failed to read Excel: {str(e)}'}, status=400)

        # 1. CLEAN HEADERS
        if imported_data.headers:
            clean_headers = [str(h).strip() for h in imported_data.headers]
            imported_data.headers = clean_headers
            print(f"DEBUG: Found Headers: {clean_headers}")

        saved_count = 0
        failed_rows = []
        
        # 2. ITERATE ROWS
        for index, row in enumerate(imported_data.dict):
            try:
                card_no = row.get('Card No')
                if not card_no:
                    failed_rows.append(f"Row {index+2}: Missing 'Card No'")
                    continue
                
                card_no = str(card_no).strip()

                BiometricAttendance.objects.update_or_create(
                    card_no=card_no,
                    attendance_date=date_str,
                    defaults={
                        'sr_no': self.safe_int(row.get('Sr.No.')),
                        'pay_code': row.get('PayCode'),
                        'employee_name': row.get('Employee Name'),
                        'department': row.get('Department'),
                        'designation': row.get('Designation'),
                        'shift': row.get('Shift'),
                        
                        # TIME PARSING
                        'start': self.parse_time(row.get('Start')),
                        'in_time': self.parse_time(row.get('In')),
                        'out_time': self.parse_time(row.get('Out')),
                        
                        'hrs_works': str(row.get('Hrs Works') or ''),
                        'status': row.get('Status'),
                        'early_arrival': str(row.get('Early Arriv.') or ''),
                        'late_arrival': str(row.get('Late Arriv.') or ''),
                        'shift_early': str(row.get('Shift Early') or ''),
                        'excess_lunch': str(row.get('Excess Lunch') or ''),
                        'ot': str(row.get('Ot') or ''),
                        'ot_amount': str(row.get('Ot Amount') or ''),
                        'os': str(row.get('Os') or ''),
                        'manual': row.get('Manual'),
                    }
                )
                saved_count += 1
            except Exception as e:
                error_msg = f"Row {index+2} (Card {row.get('Card No')}): {str(e)}"
                print(error_msg)
                failed_rows.append(error_msg)

        response_data = {
            'success': True, 
            'message': f'Uploaded {saved_count} records.',
        }

        if failed_rows:
            response_data['message'] += f" Failed {len(failed_rows)} rows."
            response_data['details'] = failed_rows[:5]

        return Response(response_data, status=201)

    # --- HELPER FUNCTIONS ---

    def safe_int(self, val):
        try:
            if not val: return None
            return int(float(val))
        except:
            return None

    def parse_time(self, val):
        # --- FIX IS HERE ---
        # We import specifically here to ensure we have the Types, not the Module.
        from datetime import datetime as dt_class, time as time_class

        if not val or str(val).lower() == 'nan': return None
        
        # Check if it's already a datetime object (using the alias dt_class)
        if isinstance(val, dt_class):
            return val.time()
            
        # Check if it's already a time object (using the alias time_class)
        if isinstance(val, time_class):
            return val
            
        # If it's a string, parse it
        val_str = str(val).strip()
        for fmt in ('%H:%M:%S', '%H:%M', '%I:%M %p', '%H:%M:%S.%f'):
            try:
                return dt_class.strptime(val_str, fmt).time()
            except ValueError:
                continue
        
        return None

   


import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from tablib import Dataset
from .resources import BiometricAttendanceResource

class ExcelUploadFromPathView(APIView):
    # Set the path to your Excel file here
    EXCEL_FILE_PATH = r"E:\attendance.xlsx"  # Change this to your actual path

    def post(self, request, format=None):
        if not os.path.exists(self.EXCEL_FILE_PATH):
            return Response({'error': 'File not found on server path'}, status=status.HTTP_400_BAD_REQUEST)

        file_format = 'xls' if self.EXCEL_FILE_PATH.endswith('.xls') else 'xlsx'

        dataset = Dataset()
        try:
            with open(self.EXCEL_FILE_PATH, 'rb') as file_obj:
                imported_data = dataset.load(file_obj.read(), format=file_format)
        except Exception as e:
            return Response({'error': f'Failed to read Excel file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        resource = BiometricAttendanceResource()
        result = resource.import_data(imported_data, dry_run=True)

        if result.has_errors():
            errors = []
            for row_number, row_errors in result.row_errors():
                for error in row_errors:
                    errors.append(f"Row {row_number}: {str(error.error)}")
            return Response({'error': 'Import failed', 'details': errors}, status=status.HTTP_400_BAD_REQUEST)

        # Perform actual import
        resource.import_data(imported_data, dry_run=False)
        return Response({'success': 'Data imported successfully'}, status=status.HTTP_201_CREATED)



def schedule_task(task_name, task_path, time_str):
    from datetime import datetime
    from django.utils import timezone
    import pytz
    from django_celery_beat.models import PeriodicTask, CrontabSchedule
    import json

    try:
        dt = datetime.strptime(time_str.strip(), "%I:%M %p")
        hour, minute = dt.hour, dt.minute
    except ValueError:
        return None, "Invalid time format. Use HH:MM AM/PM."

    # Clean up existing task
    existing_task = PeriodicTask.objects.filter(name=task_name).first()
    if existing_task:
        old_cron = existing_task.crontab
        existing_task.delete()
        if not PeriodicTask.objects.filter(crontab=old_cron).exists():
            old_cron.delete()

    # Always ensure valid cron values
    cron, _ = CrontabSchedule.objects.get_or_create(
        minute=str(minute),
        hour=str(hour),
        day_of_week='*',
        day_of_month='*',
        month_of_year='*',
        timezone='Asia/Kolkata'
    )

    task = PeriodicTask.objects.create(
        name=task_name,
        crontab=cron,
        task=task_path,
        args=json.dumps([]),
        enabled=True
    )

    kolkata = timezone.now().astimezone(pytz.timezone('Asia/Kolkata'))
    return {
        "message": f"{task_name} scheduled at {time_str} (24-hour: {hour:02}:{minute:02})",
        "current_kolkata_time": kolkata.strftime('%Y-%m-%d %H:%M:%S'),
        "task_enabled": task.enabled
    }, None


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json
import uuid 

class SetAttendanceTaskTimeView(APIView):
    
    # --- GET: Show existing alarms ---
    def get(self, request):
        tasks = PeriodicTask.objects.filter(task="app1.tasks.import_attendance_from_excel")
        data = []
        for t in tasks:
            try:
                # Parse Time
                h = int(t.crontab.hour)
                m = int(t.crontab.minute)
                ampm = "AM" if h < 12 else "PM"
                h_12 = h if 0 < h <= 12 else h - 12
                if h == 0: h_12 = 12
                time_str = f"{h_12:02}:{m:02} {ampm}"

                # Parse Days (Crucial for your requirement)
                cron_days = t.crontab.day_of_week # e.g. "1,2,3" or "*"
                if cron_days == '*':
                    days_display = "Daily"
                    selected_days = [0,1,2,3,4,5,6]
                else:
                    # Convert "1,2,5" string to list [1,2,5]
                    selected_days = [int(d) for d in cron_days.split(',')]
                    # Helper to make nice text like "Mon, Wed"
                    day_map = {0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'}
                    if len(selected_days) == 7:
                        days_display = "Daily"
                    elif len(selected_days) == 2 and 0 in selected_days and 6 in selected_days:
                        days_display = "Weekends"
                    elif len(selected_days) == 5 and 0 not in selected_days and 6 not in selected_days:
                        days_display = "Weekdays"
                    else:
                        days_display = ", ".join([day_map[d] for d in sorted(selected_days)])

                data.append({
                    "id": t.id,
                    "time": time_str,
                    "label": t.description or "Scheduled Import",
                    "repeat_text": days_display,
                    "selected_days": selected_days,
                    "enabled": t.enabled
                })
            except Exception as e:
                print(e)
                continue 
                
        return Response(data)

    # --- POST: Create New Alarm ---
    def post(self, request):
        time_str = request.data.get("time") 
        label = request.data.get("label", "Auto Sync")
        days = request.data.get("days", []) # Expects list: [1, 2, 3] (Mon,Tue,Wed)
        
        try:
            from datetime import datetime
            dt = datetime.strptime(time_str.strip(), "%I:%M %p")
            hour, minute = dt.hour, dt.minute
        except ValueError:
            return Response({"error": "Invalid time"}, status=400)

        # Logic for Days
        # Celery uses 0-6 (Sunday=0, Saturday=6)
        if len(days) == 7 or len(days) == 0:
            cron_days = '*' # Daily
        else:
            cron_days = ','.join(str(d) for d in days)

        # Create Schedule
        cron, _ = CrontabSchedule.objects.get_or_create(
            minute=str(minute),
            hour=str(hour),
            day_of_week=cron_days, 
            timezone='Asia/Kolkata'
        )

        unique_id = str(uuid.uuid4())[:8]
        task_name = f"excel_import_{unique_id}"

        task = PeriodicTask.objects.create(
            name=task_name,
            crontab=cron,
            task="app1.tasks.import_attendance_from_excel", 
            args=json.dumps([]),
            description=label,
            enabled=True
        )

        return Response({"success": True})

    # --- DELETE ---
    def delete(self, request):
        task_id = request.query_params.get("id")
        try:
            PeriodicTask.objects.get(id=task_id).delete()
            return Response({"success": True})
        except:
            return Response({"error": "Not found"}, status=404)

    # --- PATCH (Toggle) ---
    def patch(self, request):
        task_id = request.data.get("id")
        try:
            task = PeriodicTask.objects.get(id=task_id)
            task.enabled = request.data.get("enabled")
            task.save()
            return Response({"success": True})
        except:
            return Response({"error": "Not found"}, status=404)



from django.db.models import Count, Sum, Case, When, IntegerField, FloatField
from django.db.models.functions import Cast # <--- NEW IMPORT
# ... keep other imports ...

class MonthlySummaryView(APIView):
    def get(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if not month or not year:
            return Response({'error': 'Month and Year required'}, status=400)

        summary = BiometricAttendance.objects.filter(
            attendance_date__year=year,
            attendance_date__month=month
        ).values('card_no', 'employee_name', 'department', 'designation').annotate(
            # 1. Counts
            total_present=Count(Case(When(status__istartswith='P', then=1), output_field=IntegerField())),
            total_absent=Count(Case(When(status__istartswith='A', then=1), output_field=IntegerField())),
            
            # 2. SUM of Hours (Converted from Text to Number)
            # Coalesce/Cast is used to handle empty strings safely
            total_early=Sum(Cast('early_arrival', FloatField())),
            total_late=Sum(Cast('late_arrival', FloatField())),
            total_ot_hours=Sum(Cast('ot', FloatField())) # <--- Sum of 'Ot' column, NOT 'Ot Amount'
            
        ).order_by('card_no')

        return Response(summary)
    



class EmployeeMonthlyDetailView(APIView):
    def get(self, request):
        card_no = request.query_params.get('card_no')
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if not card_no or not month or not year:
            return Response({'error': 'Missing parameters'}, status=400)

        # Fetch all logs for this person in this month
        logs = BiometricAttendance.objects.filter(
            card_no=card_no,
            attendance_date__year=year,
            attendance_date__month=month
        ).values('attendance_date', 'status', 'in_time', 'out_time', 'late_arrival', 'ot')

        return Response(logs)
    


import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SystemSettings
from .serializers import SystemSettingsSerializer


class SystemSettingsView(APIView):
    """
    GET: Retrieve current system settings
    POST: Create settings if not exists
    PATCH: Update the excel source path with validation
    """

    def get(self, request):
        settings = SystemSettings.objects.first()
        if not settings:
            # Create default settings if none exist
            settings = SystemSettings.objects.create(excel_source_path="")
        
        serializer = SystemSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        settings = SystemSettings.objects.first()
        if not settings:
            settings = SystemSettings.objects.create(excel_source_path="")

        new_path = request.data.get('excel_source_path', '').strip()
        
        # Validation 1: Check if path is provided
        if not new_path:
            return Response({
                'success': False,
                'error': 'Path cannot be empty'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validation 2: Check if path exists on the system
        if not os.path.exists(new_path):
            return Response({
                'success': False,
                'error': f'Path does not exist on server: {new_path}',
                'suggestion': 'Please create the folder first, then try again.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validation 3: Check if it's a directory (not a file)
        if not os.path.isdir(new_path):
            return Response({
                'success': False,
                'error': 'The path must be a folder, not a file.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Try to create Processed folder
        processed_path = os.path.join(new_path, "Processed")
        processed_created = False
        
        if not os.path.exists(processed_path):
            try:
                os.makedirs(processed_path)
                processed_created = True
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f'Could not create Processed folder: {str(e)}',
                    'suggestion': 'Please create a "Processed" folder manually inside your source folder.'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Save the path
        settings.excel_source_path = new_path
        settings.save()

        serializer = SystemSettingsSerializer(settings)
        return Response({
            'success': True,
            'message': 'Path updated successfully!',
            'processed_folder_created': processed_created,
            'data': serializer.data
        })


class ValidatePathView(APIView):
    """
    POST: Validate a path without saving it
    Used for real-time validation in frontend
    """

    def post(self, request):
        path = request.data.get('path', '').strip()
        
        if not path:
            return Response({
                'valid': False,
                'error': 'Path is empty'
            })

        path_exists = os.path.exists(path)
        is_directory = os.path.isdir(path) if path_exists else False
        processed_path = os.path.join(path, "Processed")
        processed_exists = os.path.exists(processed_path)

        # Count excel files in folder
        excel_count = 0
        if path_exists and is_directory:
            try:
                files = os.listdir(path)
                excel_count = len([f for f in files if f.endswith(('.xlsx', '.xls'))])
            except:
                pass

        return Response({
            'valid': path_exists and is_directory,
            'path_exists': path_exists,
            'is_directory': is_directory,
            'processed_folder_exists': processed_exists,
            'excel_files_count': excel_count,
            'processed_path': processed_path
        })







#================== BiometricAttendance End ==================#


# ======================= Biometric Realtime ===================================


# #---------Numax easytimepro --------------------------------------

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime
# import datetime
import threading 
from django.db.models import Q

from .models import BioUser, BiometricDevice, BiometricEnrollment
from .serializers import BioUserSerializer, BiometricDeviceSerializer, BiometricEnrollmentSerializer
from .services.easytime_client import EasyTimeClient

# ---------------------------------------------------------
# 1. BIOMETRIC DEVICE VIEWSET
# ---------------------------------------------------------
class BiometricDeviceViewSet(viewsets.ModelViewSet):
    queryset = BiometricDevice.objects.all().order_by('-id')
    serializer_class = BiometricDeviceSerializer

    @action(detail=True, methods=['post'])
    def unlock(self, request, pk=None):
        device = self.get_object()
        client = EasyTimeClient()
        result = client.unlock_terminal(device.serial_number)
        return self._send_response(result)

    @action(detail=True, methods=['post'])
    def reboot(self, request, pk=None):
        device = self.get_object()
        client = EasyTimeClient()
        result = client.reboot_terminal(device.serial_number)
        return self._send_response(result)

    def _send_response(self, result):
        if result['status'] == 'success':
            return Response(result.get('data', {'message': 'Success'}), status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

# ---------------------------------------------------------
# 2. BIO USER VIEWSET (FIXED: Auto-Sync before Enroll)
# ---------------------------------------------------------
from django.utils import timezone
class BioUserViewSet(viewsets.ModelViewSet):
    queryset = BioUser.objects.all().order_by('-id')
    serializer_class = BioUserSerializer

    # --- NEW ACTION: IMPORT FROM DEVICE/SERVER ---
    @action(detail=False, methods=['post'])
    def sync_users_from_server(self, request):
        """
        Pulls all users from EasyTimePro and saves them to BioUser table.

        Device -> Dojo Logic.
        1. FETCH: All users from EasyTimePro.
        2. FILTER: Only import if user exists in MasterTable (Ghost Check).
        3. AUDIT: Warn if user has face data but no SkillMatrix.
        """
        client = EasyTimeClient()
        print("\n [Smart Import] Starting Sync Process...")
        print("--> Fetching all users from EasyTimePro...")
        
        api_users = client.get_all_employees()

        print(f"--> Received {len(api_users)} users from Device Server.")
        
        # Counters & Lists for Detailed Reporting
        added_list = []
        updated_list = []
        skipped_list = []
        warnings = []
        synced_machines_count = 0

        # Pre-fetch valid HR IDs for fast checking
        valid_emp_ids = set(MasterTable.objects.values_list('emp_id', flat=True))

        for u_data in api_users:
            emp_code = u_data.get('emp_code')
            if not emp_code: continue # Skip if no employee code

            # A. MASTER TABLE VALIDATION (Ghost Check)
            # If they are on the device but not in HR records, IGNORE them.
            if emp_code not in valid_emp_ids:
                # Log to Console so you know WHO is being skipped
                print(f"   🚫 Skipping Ghost User: {emp_code} (Not in MasterTable)")
                skipped_list.append(emp_code)
                continue # Skip this user
            
            # B. DATA PREP
            first_name = u_data.get('first_name', 'Unknown')
            
            last_name = u_data.get('last_name') or ""
            # if last_name is None:
            #     last_name = ""

            # Check Biometric Status from API data
            has_finger = u_data.get('fingerprint', '-') != '-'
            has_face = (u_data.get('face', '-') != '-') or (u_data.get('vl_face', '-') != '-')

            # --- FIX: Define this variable ---
            has_biometric_data = has_face or has_finger

            # C. SKILL AUDIT & PROPAGATION DATA
            # target_areas = [2] # Default Area
            # target_areas = [13] # DojoRoom (Area)device id

            # --- DYNAMIC DEFAULT AREA ---
            target_areas = []
            try:
                # Find the device marked as Enrollment Device
                enroll_dev = BiometricDevice.objects.filter(is_enrollment_device=True).first()
                if enroll_dev:
                    # We can't easily get the Area ID without an API call, 
                    # so for Import/Audit, we might skip adding it to 'target_areas' 
                    # because we are just auditing. 
                    # OR we make a quick API call if strict correctness is needed.
                    pass 
            except: pass
            
            eligible_machines = []

            # If they have face data (ready to work), check if they actually have a Skill assigned.
            # if has_face:
            #     has_skill = SkillMatrix.objects.filter(emp_id=emp_code).exists()
            #     if not has_skill:
            #         warn_msg = f"User {emp_code} ({first_name}) has Face Data but NO Skills."
            #         warnings.append(warn_msg)
            #         print(f"   ⚠️  Warning: {warn_msg}")
            
            
            # --- FIX: Check has_biometric_data instead of just has_face ---
            if has_biometric_data:
                # 1. Fetch Skills for this user
                user_skills = SkillMatrix.objects.filter(emp_id=emp_code)
                
                if user_skills.exists():
                    # 2. Calculate Areas & Machines
                    for skill in user_skills:
                        if skill.hierarchy and skill.hierarchy.station:
                            # Add Area
                            s_name = skill.hierarchy.station.station_name
                            a_id = client.ensure_area(s_name)
                            if a_id not in target_areas: target_areas.append(a_id)
                            
                            # Find Machines linked to this Station
                            machines = Machine.objects.filter(
                                process=skill.hierarchy.station,
                                biometric_device__isnull=False
                            ).select_related('biometric_device')
                            
                            for m in machines:
                                eligible_machines.append(m)
                else:
                    warn_msg = f"User {emp_code} ({first_name}) has Face Data but NO Skills."
                    warnings.append(warn_msg)
                    print(f"   ⚠️  Warning: {warn_msg}")

            # Update or Create in Local DB- Dojo
            try:
                obj, created = BioUser.objects.update_or_create(
                    employeeid=emp_code,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name, # Now safely a string
                        'has_face': has_face,
                        'has_fingerprint': has_finger,
                        'last_status_sync': timezone.now()
                    }
                )
                if created: 
                    print(f"   ✅ Added New User: {emp_code}")
                    added_list.append(emp_code)
                else: 
                    # print(f"   🔄 Updated User: {emp_code}") # Uncomment if you want verbose logs
                    updated_list.append(emp_code)

                # --- E. AUTO-PROPAGATE (The Fix) ---
                # If user is valid, has has_biometric_data, and has eligible machines -> Push to them NOW.
                if has_biometric_data and eligible_machines:
                    
                    # 1. Fetch REAL Department from MasterTable
                    try:
                        mt = MasterTable.objects.get(emp_id=emp_code)
                        # Ensure we use .department_name as per your model
                        real_dept_name = mt.department.department_name if mt.department else "General"
                    except:
                        real_dept_name = "General"
                    
                    # 2. Get the Department ID for EasyTime
                    dept_id = client.ensure_department(real_dept_name)
                    
                    print(f"      ↳ 🚀 Auto-Syncing {emp_code} to {len(eligible_machines)} Machines (Dept: {real_dept_name})...")
                    
                    for machine in eligible_machines:
                        # Run in thread to not block the loop
                        threading.Thread(
                            target=self._task_push_to_device,
                            args=(obj, machine.biometric_device, target_areas, dept_id)
                        ).start()
                        synced_machines_count += 1

            except Exception as e:
                print(f"   ❌ Error Saving(Skipping) {emp_code}: {e}")

        # --- FINAL CONSOLE REPORT ---
        print("\n" + "="*40)
        print(f"📊 SYNC REPORT SUMMARY")
        print(f"   ✅ Added:   {len(added_list)}  {added_list if added_list else ''}")
        print(f"   🔄 Updated: {len(updated_list)}")
        print(f"   🚫 Skipped: {len(skipped_list)}  {skipped_list if skipped_list else ''}")
        print(f"   🚀 Triggered Syncs: {synced_machines_count} machine updates")
        print("="*40 + "\n")
        
        # --- FRONTEND MESSAGE ---
        msg = f"Sync Complete.\n✅ Added: {len(added_list)}\n🔄 Updated: {len(updated_list)}\n🚫 Skipped (Unknown): {len(skipped_list)}"
        
        # Add details of skipped users to the frontend alert if it's a small number
        if len(skipped_list) > 0 and len(skipped_list) < 5:
            msg += f"\n(Skipped IDs: {', '.join(skipped_list)})"


        if warnings:
            msg += f"\n\n⚠️ Warnings ({len(warnings)}):\n" + "\n".join(warnings[:3]) 
            if len(warnings) > 3: msg += f"\n...and {len(warnings)-3} more."

        return Response({
            "status": "success", 
            "message": msg,
        })

    # --- Helper Method for Threading ---
    def _task_push_to_device(self, bio_user, device, area_ids, dept_id):
        client = EasyTimeClient()
        if not device.serial_number: return
        
        # Provision User + Areas
        client.provision_employee_to_device(
            bio_user, device.serial_number, area_ids=area_ids, dept_id=dept_id
        )
        # Log it
        BiometricEnrollment.objects.get_or_create(bio_user=bio_user, device=device)


    @action(detail=True, methods=['post'])
    def enroll_face(self, request, pk=None):
        bio_user = self.get_object()
        device_id = request.data.get('device_id')
        
        device = self._get_device(device_id)
        if not device: 
            return Response({'error': 'Device not found'}, status=404)

        client = EasyTimeClient()

        print(f"--> Ensuring {bio_user.employeeid} exists in EasyTime before enrolling...")
        # Capture sync result to see if THIS failed
        sync_res = client.provision_employee_to_device(bio_user, device.serial_number)
        print(f"--> User Sync Status: {sync_res}")

        # Send Enroll Command
        print(f"--> Sending Remote Enroll Command to Device SN: {device.serial_number}")
        result = client.enroll_remotely(device.serial_number, bio_user.employeeid, 2)
        
        # CRITICAL DEBUGGING: Print the result to console
        print(f"--> Enroll Result: {result}") 
        
        return self._send_response(result)

    @action(detail=True, methods=['post'])
    def enroll_fingerprint(self, request, pk=None):
        bio_user = self.get_object()
        device_id = request.data.get('device_id')
        device = self._get_device(device_id)
        if not device: return Response({'error': 'Device not found'}, status=404)
        
        finger_idx = int(request.data.get('finger_index', 6))
        client = EasyTimeClient()
        
        print(f"--> Ensuring {bio_user.employeeid} exists in EasyTime before enrolling...")
        client.provision_employee_to_device(bio_user, device.serial_number)
        
        print(f"--> Sending Remote FP Enroll Command...")
        result = client.enroll_remotely(device.serial_number, bio_user.employeeid, 1, finger_idx)
        
        # CRITICAL DEBUGGING
        print(f"--> Enroll Result: {result}") 
        return self._send_response(result)

    @action(detail=True, methods=['post'])
    def sync_to_device(self, request, pk=None):
        bio_user = self.get_object()
        device = self._get_device(request.data.get('device_id'))
        if not device: return Response({'error': 'Device not found'}, status=404)

        client = EasyTimeClient()
        success = client.provision_employee_to_device(bio_user, device.serial_number)
        
        if success:
            BiometricEnrollment.objects.get_or_create(bio_user=bio_user, device=device)
            return Response({'status': 'success', 'message': f'Synced to {device.name}'})
        return Response({'status': 'error', 'message': 'Sync Failed'}, status=400)

    def _get_device(self, device_id):
        try:
            return BiometricDevice.objects.get(id=device_id)
        except BiometricDevice.DoesNotExist:
            return None

    # --- NEW: REFRESH BIO STATUS ---
    @action(detail=True, methods=['post'])
    def refresh_status(self, request, pk=None):
        """
        Checks EasyTimePro for Biometric Data.
        Returns 200 OK even if user is missing (sets status to False).
        """
        bio_user = self.get_object()
        client = EasyTimeClient()
        
        print(f"--> Checking Bio Status for {bio_user.employeeid}...")
        result = client.get_employee_bio_status(bio_user.employeeid)
        
        # Default to False if check failed
        has_face = False
        has_finger = False
        status_msg = "checked"

        if result.get('status') == 'success':
            has_face = result['has_face']
            has_finger = result['has_fingerprint']
        else:
            print(f"   ⚠️ EasyTime Check Failed: {result.get('message')}")
            # If user not found in EasyTime, we assume they have NO bio data.
            # We do NOT return 400, because we want the UI to update to "No".
            status_msg = "User not found in EasyTime (assumed empty)"

        # Update DB
        bio_user.has_fingerprint = has_finger
        bio_user.has_face = has_face
        bio_user.save()
        
        print(f"   ✅ Local DB Updated: Face={has_face}, FP={has_finger}")
        
        return Response({
            'status': 'success', 
            'message': status_msg,
            'has_fingerprint': has_finger,
            'has_face': has_face
        }, status=status.HTTP_200_OK)

    def _send_response(self, result):
        if result['status'] == 'success':
            return Response(result.get('data', {'message': 'Success'}), status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    # --- ACTION: REVOKE MACHINE ACCESS (Safe Delete) ---
    @action(detail=True, methods=['post'])
    def revoke_access(self, request, pk=None):
        bio_user = self.get_object()
        client = EasyTimeClient()
        
        print(f"--> Revoking Machine Access for {bio_user.employeeid}...")
        result = client.remove_dojo_access(bio_user.employeeid)
        
        if result.get('status') == 'success':
            # Optionally: Clear local enrollment records to reflect this
            BiometricEnrollment.objects.filter(bio_user=bio_user).delete()
            return Response({'status': 'success', 'message': result['message']})
        
        return Response({'status': 'error', 'message': result['message']}, status=400)

# ---------------------------------------------------------
# 3. ATTENDANCE LOG VIEW (Unchanged from previous fix)
# ---------------------------------------------------------
from django.utils.timezone import make_aware
from .models import OperatorDailyLog
from .serializers import OperatorDailyLogSerializer

# ---------------------------------------------------------
# 3. ATTENDANCE LOG VIEW (UPDATED LOGIC)
# ---------------------------------------------------------
class AttendanceLogView(APIView):
    def get(self, request):
        # 1. Setup Dates
        date_str = request.query_params.get('date', datetime.now().strftime("%Y-%m-%d"))
        from_dt = f"{date_str} 00:00:00"
        to_dt = f"{date_str} 23:59:59"
        
        # 2. Fetch Data from EasyTime
        client = EasyTimeClient()
        raw_logs = client.get_attendance_logs(from_dt, to_dt) 
        
        formatted_logs = []
        saved_count = 0

        # 3. Optimizations (Cache Lookups to avoid DB hits in loop)
        local_users = {user.employeeid: user for user in BioUser.objects.all()}
        
        # Cache devices map: Serial Number -> Device Object
        local_devices = {d.serial_number: d for d in BiometricDevice.objects.all()}

        # 4. Process Logs
        for log in raw_logs:
            emp_code = log.get('emp_code', 'Unknown')
            punch_time_str = log.get('punch_time')
            terminal_sn = log.get('terminal_sn', '')

            try:
                dt_obj = datetime.strptime(punch_time_str, "%Y-%m-%d %H:%M:%S")
                aware_dt = make_aware(dt_obj)
            except ValueError: continue

            user_obj = local_users.get(emp_code)
            
            # A. SAVE RAW LOG (Existing Logic)
            if user_obj:
                try:
                    _, created = LocalAttendanceLog.objects.get_or_create(
                        bio_user=user_obj,
                        punch_time=aware_dt,
                        device_sn=terminal_sn,
                        defaults={'area_alias': log.get('area_alias')}
                    )
                    if created: saved_count += 1
                except: pass

            # =========================================================
            # B. NEW: UPDATE OPERATOR DAILY LOG (The Requirement)
            # =========================================================
            if user_obj and terminal_sn in local_devices:
                device_obj = local_devices[terminal_sn]

                # STRICT RULE: Ignore Attendance Devices (Gates) & Enrollment Devices
                if not device_obj.is_attendance_device and not device_obj.is_enrollment_device:
                    
                    # Find or Create the Summary Record for (User + Machine + Day)
                    summary, created = OperatorDailyLog.objects.get_or_create(
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

                    if not created:
                        # Logic: Expand the time window
                        changed = False
                        # If new punch is earlier than stored start time -> Update Start
                        if aware_dt < summary.first_punch:
                            summary.first_punch = aware_dt
                            changed = True
                        
                        # If new punch is later than stored end time -> Update End
                        if aware_dt > summary.last_punch:
                            summary.last_punch = aware_dt
                            changed = True
                        
                        if changed: summary.save()
            # =========================================================

            # Response Data
            formatted_logs.append({
                "employee_code": emp_code,
                "employee_name": user_obj.first_name if user_obj else "Unknown",
                "device_name": log.get('terminal_alias', 'Unknown Device'),
                "device_sn": terminal_sn,
                "datetime": punch_time_str
            })

        print(f"--> Logs Processed. New Raw: {saved_count}")

        return Response({
            "date": date_str,
            "total_logs": len(formatted_logs),
            "logs": formatted_logs
        }, status=status.HTTP_200_OK)


# --- NEW VIEW FOR HISTORY PAGE ---
class OperatorHistoryView(APIView):
    """
    Returns aggregated daily data for the History Page.
    """
    def get(self, request):
        date_str = request.query_params.get('date')
        
        if not date_str:
            return Response({"error": "Date required"}, status=400)

        # Query the new summary table
        logs = OperatorDailyLog.objects.filter(date=date_str).select_related('bio_user', 'device')
        
        serializer = OperatorDailyLogSerializer(logs, many=True)
        
        return Response({
            "date": date_str,
            "count": logs.count(),
            "logs": serializer.data
        })




class BiometricEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BiometricEnrollment.objects.all().order_by('-synced_at')
    serializer_class = BiometricEnrollmentSerializer
    filterset_fields = ['bio_user__employeeid', 'device__id']

from django.db.models import Min, Max

class DailySummaryView(APIView):
    def get(self, request):
        # 1. Filter by Date
        date_str = request.query_params.get('date', datetime.now().strftime("%Y-%m-%d"))
        
        # 2. Aggregate: Find Min (First) and Max (Last) for each user
        summary = LocalAttendanceLog.objects.filter(
            punch_time__date=date_str
        ).values(
            'bio_user__employeeid', 
            'bio_user__first_name'
        ).annotate(
            first_punch=Min('punch_time'),
            last_punch=Max('punch_time')
        ).order_by('first_punch')

        data = []
        for item in summary:
            # Calculate Status logic
            f_time = item['first_punch']
            l_time = item['last_punch']
            
            # If First == Last, they haven't punched out yet (or forgot)
            status = "Working" if f_time != l_time else "Checked In"

            data.append({
                "emp_id": item['bio_user__employeeid'],
                "name": item['bio_user__first_name'],
                "in_time": f_time.strftime("%H:%M"),
                "out_time": l_time.strftime("%H:%M") if f_time != l_time else "-",
                "status": status
            })

        return Response(data)


# #---------numax easytimepro end--------------------------------------


#----------------------ESSL----------------------------------------

# from rest_framework import generics
# from .models import BioUser
# from rest_framework.decorators import action
# from .serializers import BioUserSerializer
# from .utils import add_employee_to_essl,delete_employee_from_essl,enroll_user_face,enroll_user_fp  

# class BioUserViewSet(viewsets.ModelViewSet):
#     queryset = BioUser.objects.all()
#     serializer_class = BioUserSerializer

#     def perform_create(self, serializer):
#         biouser = serializer.save()
#         add_employee_to_essl(biouser)

#     def perform_destroy(self, instance):
#         delete_employee_from_essl(instance)
#         instance.delete()

#     @action(detail=True, methods=['post'])
#     def enroll_face(self, request, pk=None):
#         biouser = self.get_object()
#         # You can get is_overwrite from request.data if you want
#         is_overwrite = request.data.get('is_overwrite', False)
#         result = enroll_user_face(biouser, is_overwrite=is_overwrite)
#         # Extract fields from the Zeep object
#         if hasattr(result, 'EnrollUserFaceResult') and hasattr(result, 'CommandId'):
#             result_dict = {
#                 'EnrollUserFaceResult': result.EnrollUserFaceResult,
#                 'CommandId': result.CommandId
#             }
#         else:
#             result_dict = str(result)  # fallback for unexpected result
#         return Response({'result': result_dict}, status=status.HTTP_200_OK)

#     @action(detail=True, methods=['post'])
#     def enroll_fingerprint(self, request, pk=None):
#         biouser = self.get_object()
#         finger_index = int(request.data.get('finger_index', 1))
#         is_overwrite = request.data.get('is_overwrite', False)

#         result = enroll_user_fp(biouser, finger_index_number=finger_index, is_overwrite=is_overwrite)
#         # Extract fields from Zeep object for JSON serialization
#         if hasattr(result, 'EnrollUserFPResult') and hasattr(result, 'CommandId'):
#             result_dict = {
#                 'EnrollUserFPResult': result.EnrollUserFPResult,
#                 'CommandId': result.CommandId
#             }
#         else:
#             result_dict = str(result)
#         return Response({'result': result_dict}, status=status.HTTP_200_OK)



# from rest_framework.views import APIView
# from rest_framework.response import Response
# from .utils import get_transactions_log
# from datetime import datetime

# class AttendanceLogView(APIView):
#     def get(self, request):
#         today = datetime.now().strftime("%Y-%m-%d")
#         from_dt = f"{today} 00:00:00"
#         to_dt = f"{today} 23:59:59"
#         result = get_transactions_log(from_dt, to_dt)
#         # Extract fields from Zeep object
#         str_data = result.strDataList if hasattr(result, 'strDataList') else ""
#         log_lines = str_data.strip().split('\n')
#         logs = []
#         for line in log_lines:
#             if line.strip():
#                 parts = line.split('\t')
#                 if len(parts) >= 2:
#                     logs.append({
#                         "employee_code": parts[0],
#                         "datetime": parts[1]
#                     })
#         return Response({
#             "count": len(logs),
#             "logs": logs
#         })

#----------------------ESSL End----------------------------------------



# ======================= Biometric Realtime End ===================================# your_app/views.py





# Add this import at the top of your views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Score, MasterTable # Import your Score and MasterTable models
from .serializers import ScoreSerializer,MasterTableHandoverDetailSerializer # Import the necessary serializers we discussed

@api_view(['GET'])
def get_passed_scores_with_details(request):
    """
    This new endpoint provides a list of passed scores, but nests the full
    employee details from MasterTable inside each score object.
    This is specifically for the Handover Sheet page to get all data in one call.
    """
    # 1. Get the initial queryset of passed scores
    #    (Use the same logic as your original /scores/passed/level-1/ view)
    passed_scores = Score.objects.filter(percentage__gte=80, level='Level 1').select_related(
        'employee', 
        'employee__department',
        'employee__current_line',
        'employee__current_station'
    ).order_by('-percentage')
    
    # 2. Use the same serializer you would have used to change the original endpoint.
    #    This serializer must have the nested 'EmployeeNestedSerializer'.
    #    We are just using it in a new, safe context.
    serializer = ScoreSerializer(passed_scores, many=True)
    
    # 3. Return the data
    return Response(serializer.data)





@api_view(['GET'])
def get_mastertable_details_for_handover(request, emp_id=None):
    """
    A dedicated, safe endpoint to get the full nested details of an employee
    (including department, line, and station names) specifically for use in
    the handover form modal. This does not affect the main /mastertable/ API.
    """
    # Use select_related for an efficient database query
    employee = get_object_or_404(
        MasterTable.objects.select_related(
            'department', 'current_line', 'current_station'
        ), 
        emp_id=emp_id
    )
    
    # We can reuse the same detailed serializer we defined before
    serializer = MasterTableHandoverDetailSerializer(employee)
    
    return Response(serializer.data)


# Add this new view function. It's safe and doesn't touch any existing code.
from .serializers import MasterTableHandoverDetailSerializer # Make sure this is imported

@api_view(['GET'])
def get_mastertable_list_for_ui(request):
    """
    A dedicated, safe endpoint that returns the FULL list of employees
    with all nested details (department, line, station) for the main UI table.
    """
    employees = MasterTable.objects.select_related(
        'department', 'current_line', 'current_station'
    ).all()
    
    # Use the same detailed serializer, but add `many=True` for a list.
    serializer = MasterTableHandoverDetailSerializer(employees, many=True)
    
    return Response(serializer.data)





# In your views.py file
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from io import BytesIO
from rest_framework.views import APIView
from rest_framework import status
from .models import (
    QuestionPaper, Score, Station, Level, MasterTable,
    # Assuming you need Department/Line models for detailed headers
    Department, Line, SubLine 
)
from django.shortcuts import get_object_or_404
from collections import defaultdict
from datetime import datetime

# --- Excel Utility Functions (adapted from your SkillMatrixExcelView) ---

# Define styles
HEADER_FILL = PatternFill(start_color='4682B4', end_color='4682B4', fill_type='solid')
HEADER_FONT = Font(bold=True, color='FFFFFF')
DATA_BORDER = Border(
    left=Side(style='thin'), right=Side(style='thin'),
    top=Side(style='thin'), bottom=Side(style='thin')
)
Q_HEADER_FILL = PatternFill(start_color='D3D3D3', end_color='D3D3D3', fill_type='solid')
Q_HEADER_FONT = Font(bold=True, color='000000')


class ResultsMatrixExcelView(APIView):
    """
    Generates an Excel download of the detailed Question-Level Matrix results.
    """
    def get(self, request, level_id, station_id):
        try:
            # 1. Fetch the data using the same logic as LevelStationMatrixView
            
            # A. Get Question Paper (for identifying questions)
            qp = QuestionPaper.objects.filter(
                level_id=level_id,
                station_id=station_id
            ).first()

            if not qp:
                return Response({"error": "No Question Paper found for this Level and Station."}, status=status.HTTP_404_NOT_FOUND)

            # B. Get all questions (for columns)
            questions_qs = qp.template_questions.order_by("id")
            
            question_headers = [{
                "id": q.id,
                "text": q.question,
                "correct_ans_letter": chr(65 + [q.option_a, q.option_b, q.option_c, q.option_d].index(q.correct_answer)) if q.correct_answer in [q.option_a, q.option_b, q.option_c, q.option_d] else "N/A",
                "correct_index": [q.option_a, q.option_b, q.option_c, q.option_d].index(q.correct_answer) if q.correct_answer in [q.option_a, q.option_b, q.option_c, q.option_d] else -2
            } for q in questions_qs]

            # C. Get all Score records (LATEST score per employee - PYTHON FILTERING)
            raw_scores = Score.objects.select_related(
                'employee', 'test', 'level', 'skill'
            ).filter(
                level_id=level_id,
                skill_id=station_id 
            ).order_by('-test__created_at') # Fetch all, newest first
            
            # Use Python dictionary to keep only the LATEST score for each employee
            latest_scores_map = {}
            for score in raw_scores:
                employee_key = score.employee.emp_id 
                if employee_key not in latest_scores_map:
                    latest_scores_map[employee_key] = score
            
            all_scores = list(latest_scores_map.values())
            
            # D. Compile the Employee Results (with detailed question answers)
            employee_results = []

            first_score = all_scores[0] if all_scores else None
           
            for score in all_scores:
                employee = score.employee
                raw_answers = score.raw_answers if isinstance(score.raw_answers, list) else []
    
                test_session = score.test # Retrieve the TestSession object
                
                test_name = test_session.test_name if test_session else 'N/A (No Test Session)'
                test_date = test_session.created_at.strftime('%Y-%m-%d %H:%M') if test_session and test_session.created_at else 'N/A'
                
                q_results = []
                for i, q_header in enumerate(question_headers):
                    employee_ans_index = raw_answers[i] if i < len(raw_answers) else -1
                    correct_index = q_header['correct_index']
                    
                    is_correct = (employee_ans_index == correct_index and employee_ans_index != -1)
                    
                    # Convert submitted index to Letter (A=0, B=1, etc.)
                    submitted_letter = chr(65 + employee_ans_index) if employee_ans_index >= 0 else "-"

                    q_results.append({
                        "is_correct": is_correct,
                        "submitted_ans_letter": submitted_letter,
                        "correct_ans_letter": q_header['correct_ans_letter']
                    })

                employee_results.append({
                    "employee_id": employee.emp_id,
                    "employee_name": f"{employee.first_name} {employee.last_name}",
                    "overall_marks": score.marks,
                    "overall_percentage": score.percentage,
                    "test_name": test_name,
                    "test_date": test_date,
                    "question_results": q_results
                })

            # 2. Generate Excel Content
            buffer = BytesIO()
            wb = Workbook()
            ws = wb.active
            ws.title = "Exam Matrix Report"
            
            self._create_excel_content(ws, {
                'level_id': level_id,
                'station_id': station_id,
                'level_name': first_score.level.level_name if first_score and first_score.level else 'N/A',
                'station_name': first_score.skill.station_name if first_score and first_score.skill else 'N/A',
                'question_paper_name': qp.question_paper_name,
                'question_headers': question_headers,
                'employee_results': employee_results
            })

            # 3. Save and Return Response
            wb.save(buffer)
            buffer.seek(0)
            
            filename = f"Matrix_Report_{level_id}_{station_id}_{datetime.now().strftime('%Y%m%d')}.xlsx"
            response = HttpResponse(
                buffer.getvalue(), 
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            logger.error("Error generating Excel matrix: %s", traceback.format_exc())
            return Response({'error': 'Internal server error during Excel generation', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def _create_excel_content(self, ws, data):
        """Generates the main structure and content for the Excel report."""
        current_row = 1
        
        # --- Title/Metadata Section ---
        ws.merge_cells(f'A{current_row}:H{current_row}')
        title_cell = ws[f'A{current_row}']
        title_cell.value = f"Skill Exam Matrix Report: {data['level_name']} | {data['station_name']}"
        title_cell.font = Font(size=16, bold=True, color='2E4D6B')
        title_cell.alignment = Alignment(horizontal='center')
        current_row += 1
        
        ws.merge_cells(f'A{current_row}:H{current_row}')
        ws[f'A{current_row}'].value = f"Question Paper: {data['question_paper_name']}"
        ws[f'A{current_row}'].font = Font(size=10, italic=True)
        ws[f'A{current_row}'].alignment = Alignment(horizontal='center')
        current_row += 2
        
        # --- Question Key Section ---
        ws[f'A{current_row}'].value = "Question Key"
        ws[f'A{current_row}'].font = Font(size=12, bold=True)
        current_row += 1
        
        key_headers = ["Q No.", "Question Preview", "Correct Answer"]
        for col, header in enumerate(key_headers, 1):
            cell = ws.cell(row=current_row, column=col, value=header)
            cell.font = HEADER_FONT
            cell.fill = HEADER_FILL
            cell.alignment = Alignment(horizontal='center')
            cell.border = DATA_BORDER
            
        current_row += 1
        
        for index, q in enumerate(data['question_headers']):
            ws.cell(row=current_row, column=1, value=index + 1).border = DATA_BORDER
            ws.cell(row=current_row, column=2, value=q['text']).border = DATA_BORDER
            ws.cell(row=current_row, column=3, value=q['correct_ans_letter']).border = DATA_BORDER
            current_row += 1
            
        current_row += 2
        
        # --- Main Matrix Table Headers ---
        matrix_start_row = current_row
        
        # Static Headers
        headers = [
            "S.No", 
            "Employee ID", 
            "Employee Name", 
            "Test Name", 
            "Test Date",
            "Total Correct",
            "Percentage (%)",
            "Result"
        ]
        
        # Dynamic Question Headers (Q1, Q2, Q3...)
        for index in range(len(data['question_headers'])):
            headers.append(f"Q{index + 1} Result")
            headers.append(f"Q{index + 1} Submitted")
            headers.append(f"Q{index + 1} Correct") # Hidden but useful for filtering
        
        # Write Main Headers
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=current_row, column=col, value=header)
            cell.font = HEADER_FONT
            cell.fill = HEADER_FILL
            cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
            cell.border = DATA_BORDER
        
        current_row += 1

        # --- Main Matrix Table Data ---
        for idx, emp in enumerate(data['employee_results'], 1):
            col = 1
            
            # Static Data
            ws.cell(row=current_row, column=col, value=idx).border = DATA_BORDER; col += 1
            ws.cell(row=current_row, column=col, value=emp['employee_id']).border = DATA_BORDER; col += 1
            ws.cell(row=current_row, column=col, value=emp['employee_name']).border = DATA_BORDER; col += 1
            ws.cell(row=current_row, column=col, value=emp['test_name']).border = DATA_BORDER; col += 1
            ws.cell(row=current_row, column=col, value=emp['test_date']).border = DATA_BORDER; col += 1
            ws.cell(row=current_row, column=col, value=emp['overall_marks']).border = DATA_BORDER; col += 1
            
            # Percentage with style
            perc_cell = ws.cell(row=current_row, column=col, value=f"{emp['overall_percentage']:.1f}%")
            perc_cell.border = DATA_BORDER
            if emp['overall_percentage'] >= 80:
                perc_cell.font = Font(bold=True, color='008000') # Green
            elif emp['overall_percentage'] >= 50:
                perc_cell.font = Font(bold=True, color='FFA500') # Orange
            else:
                perc_cell.font = Font(bold=True, color='FF0000') # Red
            col += 1

            # Result (Pass/Retraining/Fail)
            result = 'Pass' if emp['overall_percentage'] >= 80 else 'Retraining' if emp['overall_percentage'] >= 50 else 'Fail'
            ws.cell(row=current_row, column=col, value=result).border = DATA_BORDER; col += 1
            
            # Dynamic Question Results
            for qResult in emp['question_results']:
                # Q[X] Result (Correct/Incorrect)
                result_cell = ws.cell(row=current_row, column=col, value="CORRECT" if qResult['is_correct'] else "INCORRECT")
                result_cell.font = Font(color='008000' if qResult['is_correct'] else 'FF0000', bold=True)
                result_cell.border = DATA_BORDER
                col += 1
                
                # Q[X] Submitted Answer
                ws.cell(row=current_row, column=col, value=qResult['submitted_ans_letter']).border = DATA_BORDER
                col += 1
                
                # Q[X] Correct Answer
                ws.cell(row=current_row, column=col, value=qResult['correct_ans_letter']).border = DATA_BORDER
                col += 1

            current_row += 1

        # --- Adjust Column Widths ---
        self._adjust_column_widths(ws)

    def _adjust_column_widths(self, ws):
        """Auto-adjust column widths based on content."""
        dims = {}
        for row in ws.rows:
            for cell in row:
                if cell.value:
                    dims[cell.column] = max((dims.get(cell.column, 0), len(str(cell.value))))
        
        # Set max width limits
        for col, value in dims.items():
            col_letter = get_column_letter(col)
            # Apply reasonable limits for readability
            if col == 2 or col == 3: # ID and Name columns
                ws.column_dimensions[col_letter].width = min(value + 2, 25)
            elif col >= 9: # Question columns
                ws.column_dimensions[col_letter].width = 15
            else:
                ws.column_dimensions[col_letter].width = min(value + 2, 20)          







#=======================auto fetch biomatric to dashboard ===========================================


from django.http import JsonResponse
from django.utils import timezone
from .models import BiometricAttendance, SkillMatrix, AdvanceManpowerDashboard

def bifurcation_stats_view(request):
    # ==============================================================================
    # 1. Setup Dates & Parameters
    # ==============================================================================
    now = timezone.now()
    today_date = now.date()
    current_month = now.month
    current_year = now.year

    # Get Query Parameters
    hq_id = request.GET.get('hq')
    factory_id = request.GET.get('factory')
    department_id = request.GET.get('department')
    line_id = request.GET.get('line')
    subline_id = request.GET.get('subline')
    station_id = request.GET.get('station')

    # ==============================================================================
    # SECTION A: AVAILABLE (Live Data)
    # ==============================================================================
    
    # 1. Get IDs of employees present today
    present_emp_ids = BiometricAttendance.objects.filter(
        created_at__date=today_date
    ).values_list('card_no', flat=True).distinct()

    # 2. Base QuerySet for SkillMatrix based on attendance
    available_qs = SkillMatrix.objects.filter(employee__emp_id__in=present_emp_ids)

    # 3. Apply Hierarchy Filters to Available QS
    if hq_id and hq_id != 'null': 
        available_qs = available_qs.filter(hierarchy__hq_id=hq_id)
    if factory_id and factory_id != 'null': 
        available_qs = available_qs.filter(hierarchy__factory_id=factory_id)
    if department_id and department_id != 'null': 
        available_qs = available_qs.filter(hierarchy__department_id=department_id)
    if line_id and line_id != 'null': 
        available_qs = available_qs.filter(hierarchy__line_id=line_id)
    if subline_id and subline_id != 'null': 
        available_qs = available_qs.filter(hierarchy__subline_id=subline_id)
    if station_id and station_id != 'null': 
        available_qs = available_qs.filter(hierarchy__station_id=station_id)

    # 4. Calculate Counts (Using DISTINCT to avoid duplicate employee counts)
    # This ensures 1 person = 1 count, even if they have multiple skills 
    # relevant to the current filter context.
    l1_available = available_qs.filter(level__level_name__icontains="1").values('employee').distinct().count()
    l2_available = available_qs.filter(level__level_name__icontains="2").values('employee').distinct().count()
    l3_available = available_qs.filter(level__level_name__icontains="3").values('employee').distinct().count()
    l4_available = available_qs.filter(level__level_name__icontains="4").values('employee').distinct().count()

    # ==============================================================================
    # SECTION B: REQUIRED (Budget Data with Overwrite Logic)
    # ==============================================================================
    
    # 1. Fetch ALL records for this Month/Year
    dashboard_qs = AdvanceManpowerDashboard.objects.filter(
        month=current_month,
        year=current_year
    )

    # 2. Apply Hierarchy Filters to Required QS
    if hq_id and hq_id != 'null': 
        dashboard_qs = dashboard_qs.filter(hq_id=hq_id)
    if factory_id and factory_id != 'null': 
        dashboard_qs = dashboard_qs.filter(factory_id=factory_id)
    if department_id and department_id != 'null': 
        dashboard_qs = dashboard_qs.filter(department_id=department_id)
    if line_id and line_id != 'null': 
        dashboard_qs = dashboard_qs.filter(line_id=line_id)
    if subline_id and subline_id != 'null': 
        dashboard_qs = dashboard_qs.filter(subline_id=subline_id)
    if station_id and station_id != 'null': 
        dashboard_qs = dashboard_qs.filter(station_id=station_id)

    # 3. Order by created_at ASC (Oldest -> Newest)
    rows = dashboard_qs.order_by('created_at')

    # 4. Deduplicate Logic
    # Key: (Station, Subline, Line, Dept)
    unique_records = {}

    for row in rows:
        key = (row.station_id, row.subline_id, row.line_id, row.department_id)
        # Because we sort by created_at ASC, the last iteration for a specific key
        # will be the newest record, effectively overwriting older uploads.
        unique_records[key] = row

    # 5. Calculate Sums from unique records
    l1_required = 0
    l2_required = 0
    l3_required = 0
    l4_required = 0

    for row in unique_records.values():
        l1_required += (row.l1_required or 0) # Handle potential NoneType safety
        l2_required += (row.l2_required or 0)
        l3_required += (row.l3_required or 0)
        l4_required += (row.l4_required or 0)

    # ==============================================================================
    # SECTION C: RETURN DATA
    # ==============================================================================
    data = {
        "l1_required": l1_required,
        "l1_available": l1_available,
        "l2_required": l2_required,
        "l2_available": l2_available,
        "l3_required": l3_required,
        "l3_available": l3_available,
        "l4_required": l4_required,
        "l4_available": l4_available,
    }

    return JsonResponse(data)




# from django.db.models import Q
# from django.utils import timezone
# from django.http import JsonResponse

# def total_manpower_stats_view(request):
#     now = timezone.now()
    
#     # Get the year from the request, or default to current year
#     try:
#         target_year = int(request.GET.get('year', now.year))
#     except ValueError:
#         target_year = now.year

#     # Filters
#     hq_id = request.GET.get('hq')
#     factory_id = request.GET.get('factory')
#     department_id = request.GET.get('department')
#     line_id = request.GET.get('line')
#     subline_id = request.GET.get('subline')
#     station_id = request.GET.get('station')

#     monthly_data = []

#     # LOOP THROUGH ALL 12 MONTHS
#     for m in range(1, 13):
        
#         # --- 1. TOTAL AVAILABLE (Biometric Logic) ---
#         biometric_qs = BiometricAttendance.objects.filter(
#             attendance_date__month=m,
#             attendance_date__year=target_year
#         )
        
#         # --- FIX IS HERE ---
#         # Removed '__trim'. 
#         # 'istartswith' will catch "A", "A     ", "Absent", etc.
#         biometric_qs = biometric_qs.exclude(status__istartswith='A') 

#         present_pay_codes = biometric_qs.values_list('pay_code', flat=True).distinct()

#         available_qs = SkillMatrix.objects.filter(
#             employee__emp_id__in=present_pay_codes
#         )

#         # Apply Hierarchy Filters to SkillMatrix
#         if hq_id and hq_id != 'null': available_qs = available_qs.filter(hierarchy__hq_id=hq_id)
#         if factory_id and factory_id != 'null': available_qs = available_qs.filter(hierarchy__factory_id=factory_id)
#         if department_id and department_id != 'null': available_qs = available_qs.filter(hierarchy__department_id=department_id)
#         if line_id and line_id != 'null': available_qs = available_qs.filter(hierarchy__line_id=line_id)
#         if subline_id and subline_id != 'null': available_qs = available_qs.filter(hierarchy__subline_id=subline_id)
#         if station_id and station_id != 'null': available_qs = available_qs.filter(hierarchy__station_id=station_id)

#         total_available = available_qs.values('employee__emp_id').distinct().count()


#         # --- 2. TOTAL REQUIRED (Dashboard Logic) ---
#         dashboard_qs = AdvanceManpowerDashboard.objects.filter(month=m, year=target_year)

#         if hq_id and hq_id != 'null': dashboard_qs = dashboard_qs.filter(hq_id=hq_id)
#         if factory_id and factory_id != 'null': dashboard_qs = dashboard_qs.filter(factory_id=factory_id)
#         if department_id and department_id != 'null': dashboard_qs = dashboard_qs.filter(department_id=department_id)
#         if line_id and line_id != 'null': dashboard_qs = dashboard_qs.filter(line_id=line_id)
#         if subline_id and subline_id != 'null': dashboard_qs = dashboard_qs.filter(subline_id=subline_id)
#         if station_id and station_id != 'null': dashboard_qs = dashboard_qs.filter(station_id=station_id)

#         # Deduplication Logic
#         rows = dashboard_qs.order_by('created_at')
#         unique_records = {}
#         for row in rows:
#             key = (row.station_id, row.subline_id, row.line_id, row.department_id, row.factory_id)
#             unique_records[key] = row

#         total_required = 0
#         for row in unique_records.values():
#             # --- CHANGED HERE ---
#             # Now strictly using 'operators_required'
#             total_required += (row.operators_required or 0)

#         # Append results for this specific month
#         monthly_data.append({
#             "month": m,
#             "total_required": total_required,
#             "total_available": total_available
#         })

#     return JsonResponse(monthly_data, safe=False)

from django.db.models import Q
from django.utils import timezone
from django.http import JsonResponse
# Import your models (BiometricAttendance, SkillMatrix, AdvanceManpowerDashboard, etc.)

def total_manpower_stats_view(request):
    now = timezone.now()
    
    # 1. Determine the Financial Start Year
    req_year = request.GET.get('year')
    if req_year:
        try:
            start_year = int(req_year)
        except ValueError:
            start_year = now.year
    else:
        # If current month is Jan-Mar, FY started last year
        if now.month < 4:
            start_year = now.year - 1
        else:
            start_year = now.year

    # 2. Define the Sequence: Apr-Dec (StartYear) + Jan-Mar (StartYear + 1)
    # List of tuples: (month_int, year_int)
    fy_months = [
        (4, start_year), (5, start_year), (6, start_year), 
        (7, start_year), (8, start_year), (9, start_year), 
        (10, start_year), (11, start_year), (12, start_year),
        (1, start_year + 1), (2, start_year + 1), (3, start_year + 1)
    ]

    # Filters
    hq_id = request.GET.get('hq')
    factory_id = request.GET.get('factory')
    department_id = request.GET.get('department')
    line_id = request.GET.get('line')
    subline_id = request.GET.get('subline')
    station_id = request.GET.get('station')

    monthly_data = []

    # 3. LOOP THROUGH THE DEFINED FY MONTHS
    for m, y in fy_months:
        
        # --- 1. TOTAL AVAILABLE (Biometric Logic) ---
        biometric_qs = BiometricAttendance.objects.filter(
            attendance_date__month=m,
            attendance_date__year=y  # Uses y (either start_year or start_year+1)
        )
        
        biometric_qs = biometric_qs.exclude(status__istartswith='A') 

        present_pay_codes = biometric_qs.values_list('pay_code', flat=True).distinct()

        available_qs = SkillMatrix.objects.filter(
            employee__emp_id__in=present_pay_codes
        )

        # Apply Hierarchy Filters to SkillMatrix
        if hq_id and hq_id != 'null': available_qs = available_qs.filter(hierarchy__hq_id=hq_id)
        if factory_id and factory_id != 'null': available_qs = available_qs.filter(hierarchy__factory_id=factory_id)
        if department_id and department_id != 'null': available_qs = available_qs.filter(hierarchy__department_id=department_id)
        if line_id and line_id != 'null': available_qs = available_qs.filter(hierarchy__line_id=line_id)
        if subline_id and subline_id != 'null': available_qs = available_qs.filter(hierarchy__subline_id=subline_id)
        if station_id and station_id != 'null': available_qs = available_qs.filter(hierarchy__station_id=station_id)

        total_available = available_qs.values('employee__emp_id').distinct().count()


        # --- 2. TOTAL REQUIRED (Dashboard Logic) ---
        dashboard_qs = AdvanceManpowerDashboard.objects.filter(month=m, year=y) # Uses y

        if hq_id and hq_id != 'null': dashboard_qs = dashboard_qs.filter(hq_id=hq_id)
        if factory_id and factory_id != 'null': dashboard_qs = dashboard_qs.filter(factory_id=factory_id)
        if department_id and department_id != 'null': dashboard_qs = dashboard_qs.filter(department_id=department_id)
        if line_id and line_id != 'null': dashboard_qs = dashboard_qs.filter(line_id=line_id)
        if subline_id and subline_id != 'null': dashboard_qs = dashboard_qs.filter(subline_id=subline_id)
        if station_id and station_id != 'null': dashboard_qs = dashboard_qs.filter(station_id=station_id)

        # Deduplication Logic
        rows = dashboard_qs.order_by('created_at')
        unique_records = {}
        for row in rows:
            key = (row.station_id, row.subline_id, row.line_id, row.department_id, row.factory_id)
            unique_records[key] = row

        total_required = 0
        for row in unique_records.values():
            total_required += (row.operators_required or 0)

        # Append results
        monthly_data.append({
            "month": m, 
            "year": y, # Useful for debugging, though not strictly needed by graph
            "total_required": total_required,
            "total_available": total_available
        })

    return JsonResponse(monthly_data, safe=False)


# from django.db.models import Count, Case, When, IntegerField, Sum, FloatField, F
# from django.db.models.functions import ExtractMonth, Cast
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# import datetime

# class AbsenteeismTrendView(APIView):
#     def get(self, request):
#         # 1. Get Year from request or default to current year
#         req_year = request.query_params.get('year')
#         target_year = int(req_year) if req_year else datetime.datetime.now().year
        
#         # 2. Start with Base Queryset
#         queryset = BiometricAttendance.objects.filter(attendance_date__year=target_year)

#         # 3. --- APPLY HIERARCHY FILTERS ---
#         # Since BiometricAttendance is a flat table with string fields, 
#         # we filter based on the string columns available.
        
#         department_id = request.query_params.get('department') # The ID coming from React
        
#         if department_id:
#             # NOTE: Since your model uses a string for department (e.g. "Molding"), 
#             # but frontend sends an ID, you usually need to look up the name.
#             # Example: dept_name = Department.objects.get(id=department_id).name
#             # For now, assuming you can filter directly or map it:
            
#             # Option A: If you can fetch the name based on ID
#             # queryset = queryset.filter(department__icontains="Assembly") 
            
#             # Option B: If the frontend sends the string name (you might need to adjust frontend)
#             # queryset = queryset.filter(department__icontains=department_id)
#             pass 

#         # If you have specific logic for Factory/Line/Station, add it here using 
#         # the available columns in BiometricAttendance (like 'pay_code' or 'department')

#         # 4. Aggregate Data by Month
#         # We group by the extracted month and count Presents vs Absents
#         summary = queryset.annotate(
#             month=ExtractMonth('attendance_date')
#         ).values('month').annotate(
#             # Count Absents (Starts with 'A')
#             absent_count=Count(
#                 Case(When(status__istartswith='A', then=1), output_field=IntegerField())
#             ),
#             # Count Presents (Starts with 'P')
#             present_count=Count(
#                 Case(When(status__istartswith='P', then=1), output_field=IntegerField())
#             )
#         ).order_by('month')

#         # 5. Calculate Percentage and Format Response
#         formatted_data = []
        
#         # Initialize a dict for 1-12 months to ensure zero-filling happens in Python 
#         # (or handle it in React as you already do)
        
#         for item in summary:
#             p = item['present_count']
#             a = item['absent_count']
#             total_records = p + a
            
#             # Formula: (Absent / (Present + Absent)) * 100
#             if total_records > 0:
#                 raw_rate  = (a / total_records) * 100
#                 rate = round(raw_rate, 2)
#             else:
#                 rate = 0.0

#             formatted_data.append({
#                 'month': item['month'],
#                 'year': target_year,
#                 'absenteeism_rate': rate,
#                 # Debug info (optional, remove if not needed)
#                 'total_present': p,
#                 'total_absent': a
#             })

#         return Response(formatted_data, status=status.HTTP_200_OK)





from django.db.models import Count, Case, When, IntegerField, Q # Added Q
from django.db.models.functions import ExtractMonth, ExtractYear # Added ExtractYear
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

class AbsenteeismTrendView(APIView):
    def get(self, request):
        # 1. Determine Financial Year Start (System Year Logic)
        req_year = request.query_params.get('year')
        # now = datetime.datetime.now()
        now = datetime.now()

        if req_year:
            start_year = int(req_year)
        else:
            # If current month is Jan(1), Feb(2), or Mar(3), FY started last year
            if now.month < 4:
                start_year = now.year - 1
            else:
                start_year = now.year
        
        end_year = start_year + 1
        
        # 2. Start with Base Queryset (Financial Year Filter)
        # Filter: April-Dec of StartYear OR Jan-Mar of EndYear
        queryset = BiometricAttendance.objects.filter(
            Q(attendance_date__year=start_year, attendance_date__month__gte=4) | 
            Q(attendance_date__year=end_year, attendance_date__month__lte=3)
        )

        # 3. --- APPLY HIERARCHY FILTERS ---
        department_id = request.query_params.get('department')
        
        if department_id:
            # Your existing logic for department filtering remains here
            pass 

        # 4. Aggregate Data by Year AND Month
        # We must group by Year as well, otherwise Jan 2026 and Jan 2025 might mix
        summary = queryset.annotate(
            month=ExtractMonth('attendance_date'),
            year=ExtractYear('attendance_date') 
        ).values('year', 'month').annotate(
            absent_count=Count(
                Case(When(status__istartswith='A', then=1), output_field=IntegerField())
            ),
            present_count=Count(
                Case(When(status__istartswith='P', then=1), output_field=IntegerField())
            )
        ).order_by('year', 'month')

        # 5. Calculate Percentage and Format Response
        formatted_data = []
        
        for item in summary:
            p = item['present_count']
            a = item['absent_count']
            total_records = p + a
            
            if total_records > 0:
                raw_rate  = (a / total_records) * 100
                rate = round(raw_rate, 2)
            else:
                rate = 0.0

            formatted_data.append({
                'month': item['month'],
                'year': item['year'], # Valid Calendar Year (e.g., 2026)
                'absenteeism_rate': rate,
                'total_present': p,
                'total_absent': a
            })

        return Response(formatted_data, status=status.HTTP_200_OK)







from django.db.models import Q, Sum
from django.utils import timezone
from django.http import JsonResponse

# Ensure you import your models: BiometricAttendance, SkillMatrix, AdvanceManpowerDashboard

def current_manpower_card_view(request):
    # ==============================================================================
    # 1. Setup Dates & Parameters
    # ==============================================================================
    now = timezone.now()
    today_date = now.date()
    current_month = now.month
    current_year = now.year

    # Get Query Parameters
    hq_id = request.GET.get('hq')
    factory_id = request.GET.get('factory')
    department_id = request.GET.get('department')
    line_id = request.GET.get('line')
    subline_id = request.GET.get('subline')
    station_id = request.GET.get('station')

    # ==============================================================================
    # PART A: CALCULATE AVAILABLE (Live Data -> Sum of L1+L2+L3+L4)
    # ==============================================================================
    
    # 1. Get IDs of employees present TODAY (Live Logic)
    present_emp_ids = BiometricAttendance.objects.filter(
        created_at__date=today_date
    ).values_list('card_no', flat=True).distinct()

    # 2. Base QuerySet for SkillMatrix based on attendance
    available_qs = SkillMatrix.objects.filter(employee__emp_id__in=present_emp_ids)

    # 3. Apply Hierarchy Filters to Available QS
    if hq_id and hq_id != 'null': 
        available_qs = available_qs.filter(hierarchy__hq_id=hq_id)
    if factory_id and factory_id != 'null': 
        available_qs = available_qs.filter(hierarchy__factory_id=factory_id)
    if department_id and department_id != 'null': 
        available_qs = available_qs.filter(hierarchy__department_id=department_id)
    if line_id and line_id != 'null': 
        available_qs = available_qs.filter(hierarchy__line_id=line_id)
    if subline_id and subline_id != 'null': 
        available_qs = available_qs.filter(hierarchy__subline_id=subline_id)
    if station_id and station_id != 'null': 
        available_qs = available_qs.filter(hierarchy__station_id=station_id)

    # 4. Calculate Counts for L1, L2, L3, L4 individually
    l1_available = available_qs.filter(level__level_name__icontains="1").values('employee').distinct().count()
    l2_available = available_qs.filter(level__level_name__icontains="2").values('employee').distinct().count()
    l3_available = available_qs.filter(level__level_name__icontains="3").values('employee').distinct().count()
    l4_available = available_qs.filter(level__level_name__icontains="4").values('employee').distinct().count()

    # 5. Sum them up for Total Operators Available
    operators_available_total = l1_available + l2_available + l3_available + l4_available

    # ==============================================================================
    # PART B: CALCULATE REQUIRED (Budget Data -> Sum of L1+L2+L3+L4)
    # ==============================================================================
    dashboard_qs = AdvanceManpowerDashboard.objects.filter(
        month=current_month, 
        year=current_year
    )

    # Apply Hierarchy Filters to Required QS
    if hq_id and hq_id != 'null': 
        dashboard_qs = dashboard_qs.filter(hq_id=hq_id)
    if factory_id and factory_id != 'null': 
        dashboard_qs = dashboard_qs.filter(factory_id=factory_id)
    if department_id and department_id != 'null': 
        dashboard_qs = dashboard_qs.filter(department_id=department_id)
    if line_id and line_id != 'null': 
        dashboard_qs = dashboard_qs.filter(line_id=line_id)
    if subline_id and subline_id != 'null': 
        dashboard_qs = dashboard_qs.filter(subline_id=subline_id)
    if station_id and station_id != 'null': 
        dashboard_qs = dashboard_qs.filter(station_id=station_id)

    # Deduplication Logic (To avoid double counting stations due to multiple uploads)
    # We order by created_at so the last item in the loop is the latest record.
    rows = dashboard_qs.order_by('created_at')
    unique_records = {}
    
    for row in rows:
        key = (row.station_id, row.subline_id, row.line_id, row.department_id, row.factory_id)
        unique_records[key] = row

    # Initialize counters
    total_stations = 0
    buffer_manpower_required = 0
    buffer_manpower_available = 0
    
    # Individual Required Levels
    l1_required_sum = 0
    l2_required_sum = 0
    l3_required_sum = 0
    l4_required_sum = 0

    for row in unique_records.values():
        total_stations += (row.total_stations or 0)
        buffer_manpower_required += (row.buffer_manpower_required or 0)
        buffer_manpower_available += (row.buffer_manpower_available or 0)
        
        # Calculate Required Sums (handling NoneTypes)
        l1_required_sum += (row.l1_required or 0)
        l2_required_sum += (row.l2_required or 0)
        l3_required_sum += (row.l3_required or 0)
        l4_required_sum += (row.l4_required or 0)

    # Sum them up for Total Operators Required
    operators_required_total = l1_required_sum + l2_required_sum + l3_required_sum + l4_required_sum

    # ==============================================================================
    # PART C: RETURN JSON OBJECT
    # ==============================================================================
    data = {
        "total_stations": total_stations,
        "operators_required": operators_required_total, # Sum of L1-L4 Required
        "operators_available": operators_available_total, # Sum of L1-L4 Available
        "buffer_manpower_required": buffer_manpower_required,
        "buffer_manpower_available": buffer_manpower_available,
    }

    return JsonResponse(data)




# =================================================== end ===============================  


   
# ============================= ACTION PLAN ===================

# app/views.py
from rest_framework import generics
from .models import ActionItem, ActionItemRejection
from .serializers import ActionItemSerializer, ActionItemRejectionSerializer

# Handles GET (List) and POST (Add)
class ActionItemListCreateView(generics.ListCreateAPIView):
    queryset = ActionItem.objects.all().order_by('-date')
    serializer_class = ActionItemSerializer

# Handles PUT (Update) and DELETE (Remove) for a specific ID
class ActionItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ActionItem.objects.all()
    serializer_class = ActionItemSerializer



# Handles GET (List) and POST (Add)
class ActionItemRejectionListCreateView(generics.ListCreateAPIView):
    queryset = ActionItemRejection.objects.all().order_by('-date')
    serializer_class = ActionItemRejectionSerializer

# Handles PUT (Update) and DELETE (Remove) for a specific ID
class ActionItemRejectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ActionItemRejection.objects.all()
    serializer_class = ActionItemRejectionSerializer

# ================================ END ==================



# =================== OJT STATUS =================================

# views.py
from rest_framework import viewsets
from django.db.models import Prefetch, Q
from .models import TraineeInfo, OJTScore, OJTDay
from .serializers import OJTStatusListSerializer


class OJTStatusDashboardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OJTStatusListSerializer

    def get_queryset(self):
        qs = TraineeInfo.objects.select_related('station', 'level').prefetch_related(
            Prefetch(
                'scores',
                queryset=OJTScore.objects.select_related('topic__department', 'topic__level', 'day')
            )
        )

        # Filter by level
        level_id = self.request.query_params.get('level_id')
        if level_id:
            try:
                qs = qs.filter(level_id=int(level_id))
            except ValueError:
                return TraineeInfo.objects.none()

        # Optional search
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(emp_id__iexact=search) | Q(trainee_name__icontains=search)
            )

        return qs




# ==================tencycle=============================================



# views.py
from django.db.models import OuterRef, Subquery
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import OperatorPerformanceEvaluation
from .serializers import TenCycleStatusSerializer


class TenCycleStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns the LATEST Ten-Cycle evaluation for each employee.
    Supports filtering by level, department, station, date, status etc.
    """
    serializer_class = TenCycleStatusSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # Fixed: Use actual model field names
    search_fields = [
        'employee__emp_id',
        'employee__first_name',
        'employee__last_name',
        'department__department_name',
        'station__station_name',
    ]



    ordering_fields = ['date', 'final_percentage', 'employee__emp_id', 'created_at']
    ordering = ['-date', 'employee__emp_id']

    def get_queryset(self):
        queryset = OperatorPerformanceEvaluation.objects.all().order_by('-date')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(emp_id__icontains=search) |
                Q(employee_name__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Optional: Get overall stats (total, passed, failed, etc.)"""
        qs = self.filter_queryset(self.get_queryset())
        total = qs.count()
        passed = qs.filter(final_status='Pass').count()
        failed = qs.filter(final_status__contains='Fail').count()
        not_evaluated = qs.filter(final_status='Not Evaluated').count()
        complete = qs.filter(is_completed=True).count()
        incomplete = qs.filter(is_completed=False).count()

        return Response({
            'total': total,
            'passed': passed,
            'failed': failed,
            'not_evaluated': not_evaluated,
            'complete': complete,
            'incomplete': incomplete,
        })
    
# ==================tencycle=============================================



# views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class LevelDayRequirementViewSet(viewsets.ModelViewSet):
    serializer_class = LevelDayRequirementSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = LevelDayRequirement.objects.select_related("level").all()
        
        # Filter by level_id if provided: ?level=5
        level_id = self.request.query_params.get("level")
        if level_id is not None:
            try:
                level_id = int(level_id)
                queryset = queryset.filter(level__level_id=level_id)
            except ValueError:
                queryset = LevelDayRequirement.objects.none()  # invalid → return empty

        return queryset

    # Upsert behavior: create or update based on level
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        level = serializer.validated_data["level"]
        required_days = serializer.validated_data["required_days"]

        obj, created = LevelDayRequirement.objects.update_or_create(
            level=level,
            defaults={"required_days": required_days}
        )

        output_serializer = self.get_serializer(obj)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(output_serializer.data, status=status_code)
