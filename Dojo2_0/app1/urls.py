from django.urls import path, include, re_path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()
router.register(r'hq', HqViewSet, basename='hq')
router.register(r'factories', FactoryViewSet, basename='factory')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'lines', LineViewSet, basename='line')
router.register(r'sublines', SubLineViewSet, basename='subline')
router.register(r'stations', StationViewSet, basename='station')
router.register(r'hierarchy-structures', HierarchyStructureViewSet, basename='hierarchy-structure')


#10 cycle


router.register(r'tencycle-daily-metrics', TenCycleDailyMetricsViewSet, basename='tencycle-daily-metric')

router.register(r'tencycle-days', TenCycleDayConfigurationViewSet, basename='tencycle-day')
router.register(r'tencycle-topics', TenCycleTopicsViewSet, basename='tencycle-topic')
router.register(r'tencycle-subtopics', TenCycleSubTopicViewSet, basename='tencycle-subtopic')
router.register(r'tencycle-passingcriteria', TenCyclePassingCriteriaViewSet, basename='tencycle-passingcriteria')
router.register(r'operator-evaluations', OperatorPerformanceEvaluationViewSet, basename='operator-evaluation')
router.register(r'evaluation-marks', EvaluationSubTopicMarksViewSet, basename='evaluation-mark')
router.register(r'tencycle-configuration', TenCycleConfigurationViewSet, basename='tencycle-configuration')


router.register(r'levels', LevelViewSet)
router.register(r'days', DaysViewSet)
router.register(r'subtopics', SubTopicViewSet)
router.register(r'subtopic-contents', SubTopicContentViewSet)
router.register(r'training-contents', TrainingContentViewSet)
router.register(r'evaluations', EvaluationViewSet)
router.register(r'mastertable', MasterTableViewSet, basename='mastertable')
router.register(r'humanbody-questions', HumanBodyQuestionsViewSet, basename='humanbody-questions')
router.register(r'production-plans', ProductionPlanViewSet, basename='production-plan')

router.register(r'machines', MachineViewSet, basename='machines')
router.register(r'allocations', MachineAllocationViewSet, basename='allocations')

router.register(r'machine-allocation-approval', MachineAllocationApprovalViewSet, basename='machineallocationapproval')


router.register(r'questionpapers', QuestionPaperViewSet, basename='questionpaper')
router.register(r'station-level-questionpapers', StationLevelQuestionPaperViewSet, basename='stationlevelquestionpaper')
router.register(r'arvr-content', ARVRTrainingContentViewSet, basename='arvr-content')


router.register(r'template-questions', TemplateQuestionViewSet, basename='templatequestion')


# hanshou & shokuchou 

router.register(r'hanchou-questions', HanchouExamQuestionViewSet, basename='hanchou-questions')
router.register(r"hanchou/results", HanchouExamResultViewSet, basename="hanchou-results")

router.register(r"shokuchou-questions", ShokuchouExamQuestionViewSet, basename="shokuchou-questions")
router.register(r"shokuchou/results", ShokuchouExamResultViewSet, basename="shokuchou-results")


router.register(r'han-content', HanContentViewSet, basename='han-content')
router.register(r'han-subtopics', HanSubtopicViewSet, basename='han-subtopic')
router.register(r'han-materials', HanTrainingContentViewSet, basename='han-material')

router.register(r'sho-content', ShoContentViewSet, basename='sho-content')
router.register(r'sho-subtopics', ShoSubtopicViewSet, basename='sho-subtopic')
router.register(r'sho-materials', ShoTrainingContentViewSet, basename='sho-material')


router.register(r'ojt-topics', OJTTopicViewSet, basename='ojt-topic')
router.register(r'ojt-days', OJTDayViewSet, basename='ojt-day')
router.register(r'ojt-score-ranges', OJTScoreRangeViewSet, basename='ojt-scorerange')
router.register(r'ojt-scores', OJTScoreViewSet)
router.register(r'ojt-passing-criteria', OJTPassingCriteriaViewSet)
router.register(r'trainees', TraineeInfoViewSet, basename='trainees')
router.register(r"ojt-quantity", OJTLevel2QuantityViewSet)


# Refreshment Training
router.register(r'training-categories', Training_categoryViewSet)
router.register(r'curriculums', CurriculumViewSet, basename='curriculum')
router.register(r'curriculum-contents', CurriculumContentViewSet, basename='curriculumcontent')
router.register(r'trainer_name', Trainer_nameViewSet)
router.register(r'venues', VenueViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'empattendances', EmployeeAttendanceViewSet, basename='attendance')
router.register(r'reschedule-logs', RescheduleLogViewSet, basename='reschedulelog')


router.register(r"score-ranges", QuantityOJTScoreRangeViewSet, basename="quantity-score-range")
router.register(r"passing-criteria", QuantityPassingCriteriaViewSet, basename="quantity-passing-criteria")
router.register(r"ojt-evaluations", Level2QuantityOJTEvaluationViewSet)


router.register(r'logos', CompanyLogoViewSet)
router.register(r'evaluation-passing-criteria', EvaluationPassingCriteriaViewSet, basename='evaluation-passing-criteria')


router.register(r'retraining-sessions', RetrainingSessionViewSet, basename='retraining-session')
router.register(r'retraining-configs', RetrainingConfigViewSet, basename='retraining-config')
router.register(r'notifications', NotificationViewSet, basename='notifications')

router.register(r'levelcolours', LevelColourViewSet, basename="levelcolours")
router.register(r'displaysetting', SkillMatrixDisplaySettingViewSet, basename='displaysetting')

router.register(r'department-sublines', DepartmentSubLineViewSet, basename='department-sublines')
router.register(r'department-stations', DepartmentStationViewSet, basename='department-stations')


router.register(r"users", UserViewSet, basename="user")
router.register(r'roles', RoleViewSet, basename='role')

router.register(r'handovers', HandoverSheetViewSet, basename='handover')

router.register(r'production-data', DailyProductionDataViewSet, basename='productiondata')

router.register( r"training_topics", TrainingTopicViewSet, basename="training_topic")
router.register(r"levelwise-training-contents", LevelWiseTrainingContentViewSet, basename="levelwisetrainingcontent")

router.register(r"skill-matrix", SkillMatrixViewSet, basename="skill-matrix")


router.register(r'advance-dashboard', AdvanceManpowerDashboardViewSet, basename='advance-dashboard')
router.register(r'management-reviews', ManagementReviewViewSet, basename='managementreview')


router.register(r'employees-excel', EmployeeExcelViewSet, basename='employee-excel')


router.register(r"multiskilling", MultiSkillingViewSet, basename="multiskilling")

router.register(r"feature-flags", FeatureFlagViewSet, basename="feature-flags")


router.register(r'station-managers', StationManagerViewSet, basename='station-manager')


router.register(r'plans', views.AnnualPlanViewSet, basename='plan')
router.register(r'observationsheets', views.ObservationSheetViewSet, basename='observationsheets')


router.register(r'ten-cycle-sheets', TenCycleSheetViewSet, basename='tencyclesheet')
router.register(r'ten-cycle-entries', TencycleEntrySheetViewSet, basename='tencycleentry')
router.register(r'questions', QuestionViewSet)  


#Biometric realtime -- Numax easytimepro start--
router.register(r'biouser', BioUserViewSet, basename='biouser')
router.register(r'biometric-devices', BiometricDeviceViewSet)
router.register(r'biometric-logs', BiometricEnrollmentViewSet)
# -- Numax easytimepro end--

#Biometric Attendance
router.register(r'biometric-attendance', BiometricAttendanceViewSet, basename='biometric-attendance')


router.register(r'tencycle-status', TenCycleStatusViewSet, basename='tencycle')
router.register(r'ojt-dashboard', views.OJTStatusDashboardViewSet, basename='ojt-dashboard')
router.register(r"day-requirements", LevelDayRequirementViewSet, basename="day-requirement")




urlpatterns = [

    path('', dojo_app, name='dojo-app'), # Normal path
    path('', TemplateView.as_view(template_name='index.html'), name='root-frontend'), # TemplateView path
    path('home/', TemplateView.as_view(template_name='index.html'), name='home-frontend'), # Existing TemplateView path

    # ---------------- Auth ----------------
    path('register/', views.RegisterView.as_view(), name="register"),
    path('register/frontend/', TemplateView.as_view(template_name='index.html'), name="register-frontend"),
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('login/frontend/', TemplateView.as_view(template_name='index.html'), name='login-frontend'),
    path('logout/', views.LogoutAPIView.as_view(), name="logout"),
    path('logout/frontend/', TemplateView.as_view(template_name='index.html'), name="logout-frontend"),


    # ---------------- JWT ----------------
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/refresh/frontend/', TemplateView.as_view(template_name='index.html'), name='token-refresh-frontend'),


    # ---------------- Temp Users ----------------
    path('temp-user-info/', UserRegistrationViewSet.as_view({'get': 'list', 'post': 'create'}), name='temp-user-info'),
    path('temp-user-info/frontend/', TemplateView.as_view(template_name='index.html'), name='temp-user-info-frontend'),
    # path('users/<str:temp_id>/', UserRegistrationViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update'}), name='user-update'),
    path(
        'users/<str:temp_id>/', 
        UserRegistrationViewSet.as_view({
            'get': 'retrieve',
            'patch': 'partial_update',
            'put': 'update',
            'delete': 'destroy'  # <-- ADD THIS LINE
        }), 
        name='user-detail' # Renaming to 'user-detail' is more conventional
    ),
    path('users/<str:temp_id>/frontend/', TemplateView.as_view(template_name='index.html'), name='user-update-frontend'),


    # ---------------- Body Check ----------------
    path('human-body-checks/', BodyCheckSubmissionView.as_view(), name='human-body-checks'),
    path('human-body-checks/frontend/', TemplateView.as_view(template_name='index.html'), name='human-body-checks-frontend'),
    path('user-body-checks/', UserBodyCheckListView.as_view(), name='user-body-checks'),
    path('user-body-checks/frontend/', TemplateView.as_view(template_name='index.html'), name='user-body-checks-frontend'),
    path('human-body-checks/<str:temp_id>/', BodyCheckDetailView.as_view(), name='human-body-checks-detail'),


    # ---------------- Materials ----------------
    path('han-materials/<int:pk>/serve/', serve_han_material_file, name='serve-han-material-file'),
    path('han-materials/<int:pk>/serve/frontend/', TemplateView.as_view(template_name='index.html'), name='serve-han-material-file-frontend'),
    path('sho-materials/<int:pk>/serve/', serve_sho_material_file, name='serve-sho-material-file'),
    path('sho-materials/<int:pk>/serve/frontend/', TemplateView.as_view(template_name='index.html'), name='serve-sho-material-file-frontend'),

    # ---------------- Certificates ----------------
    path('hanchou-results/<int:pk>/download-certificate/', HanchouResultCertificatePDF.as_view(), name='download-hanchou-certificate'),
    path('hanchou-results/<int:pk>/download-certificate/frontend/', TemplateView.as_view(template_name='index.html'), name='download-hanchou-certificate-frontend'),
    path('shokuchou-results/<int:pk>/download-certificate/', ShokuchouResultCertificatePDF.as_view(), name='download-shokuchou-certificate'),
    path('shokuchou-results/<int:pk>/download-certificate/frontend/', TemplateView.as_view(template_name='index.html'), name='download-shokuchou-certificate-frontend'),


    # ---------------- OJT ----------------
    path('ojt-days-list/', OJTDayListView.as_view(), name="ojt-days-list"),
    path('ojt-days-list/frontend/', TemplateView.as_view(template_name='index.html'), name="ojt-days-list-frontend"),
    path('ojt-topics-list/', OJTTopicListView.as_view(), name="ojt-topics-list"),
    path('ojt-topics-list/frontend/', TemplateView.as_view(template_name='index.html'), name="ojt-topics-list-frontend"),
    path("trainee-info-list/", TraineeInfoListView.as_view(), name="trainee-info-list"),
    path("trainee-info-list/frontend/", TemplateView.as_view(template_name='index.html'), name="trainee-info-list-frontend"),


    # ---------------- Station ----------------
    path('station-settings/', StationSettingCreateView.as_view(), name='station-setting-create'),
    path('station-settings/frontend/', TemplateView.as_view(template_name='index.html'), name='station-setting-create-frontend'),
    path('station-requirements/', get_station_requirements, name='station-requirements'),
    path('station-requirements/frontend/', TemplateView.as_view(template_name='index.html'), name='station-requirements-frontend'),


    # ---------------- Test Session ----------------
    path('start-test/', views.StartTestSessionView.as_view(), name='start_test_session'),
    path('start-test/frontend/', TemplateView.as_view(template_name='index.html'), name='start_test_session-frontend'),
    path('api/end-test/', views.EndTestSessionView.as_view(), name='end_test_session'),
    path('api/end-test/frontend/', TemplateView.as_view(template_name='index.html'), name='end_test_session-frontend'),
    path('api/scores/', views.ScoreListView.as_view(), name='score_list'),
    path('api/scores/frontend/', TemplateView.as_view(template_name='index.html'), name='score_list-frontend'),
    path('api/test-session/map/', views.KeyIdToEmployeeNameMap.as_view(), name='keyid-name-map'),
    path('api/test-session/map/frontend/', TemplateView.as_view(template_name='index.html'), name='keyid-name-map-frontend'),
    path('api/past-sessions/', views.PastTestSessionsView.as_view()),
    path('api/past-sessions/frontend/', TemplateView.as_view(template_name='index.html'), name='past-sessions-frontend'),
    path('api/scores-by-session/<str:name>/', views.ScoresByTestView.as_view()),
    path('api/scores-by-session/<str:name>/frontend/', TemplateView.as_view(template_name='index.html'), name='scores-by-session-frontend'),
    path('api/score-summary/', views.ResultSummaryAPIView.as_view(), name='score-summary'),
    path('api/score-summary/frontend/', TemplateView.as_view(template_name='index.html'), name='score-summary-frontend'),
    path('api/skills/', views.SkillListView.as_view(), name='skill-list'),
    path('api/skills/frontend/', TemplateView.as_view(template_name='index.html'), name='skill-list-frontend'),
    path('submit-web-test/', SubmitWebTestAPIView.as_view(), name='submit-web-test'),
    path('submit-web-test/frontend/', TemplateView.as_view(template_name='index.html'), name='submit-web-test-frontend'),
    path('evaluation-eligible-employees/', EvaluationEligibleEmployeeListView.as_view(), name='evaluation-eligible-employees'),

    # **ADDED: Scores/Skills Detail**
    path('scores/passed/level-1/', LevelOnePassedUsersView.as_view(), name='passed-level-one-scores'),
    path('scores/passed/level-1/frontend/', TemplateView.as_view(template_name='index.html'), name='passed-level-one-scores-frontend'),
    re_path(r'^api/scores-by-session/(?P<name>.*)/$', views.ScoresByTestView.as_view()), # Use re_path for robustness

    # ---------------- Key Events, Connect/Vote, Assessment Mode ----------------
    path('api/key-events/create/', KeyEventCreateView.as_view()),
    path('api/key-events/create/frontend/', TemplateView.as_view(template_name='index.html'), name='key-events-create-frontend'),
    path('api/key-events/latest/', LatestKeyEventView.as_view()),
    path('api/key-events/latest/frontend/', TemplateView.as_view(template_name='index.html'), name='key-events-latest-frontend'),
    path('api/connect-events/create/', views.connect_event_create, name='connect_event_create'),
    path('api/connect-events/create/frontend/', TemplateView.as_view(template_name='index.html'), name='connect-event-create-frontend'),
    path('api/vote-events/create/', views.vote_event_create, name='vote_event_create'),
    path('api/vote-events/create/frontend/', TemplateView.as_view(template_name='index.html'), name='vote-event-create-frontend'),
    path('api/assessment-mode/', views.get_assessment_mode, name='get_assessment_mode'),
    path('api/assessment-mode/frontend/', TemplateView.as_view(template_name='index.html'), name='get-assessment-mode-frontend'),
    path('api/assessment-mode/toggle/', views.toggle_assessment_mode, name='toggle_assessment_mode'),
    path('api/assessment-mode/toggle/frontend/', TemplateView.as_view(template_name='index.html'), name='toggle-assessment-mode-frontend'),

    # ---------------- Hierarchy & Production API ----------------
    path('department/<int:department_id>/lines/', views.get_lines_by_department, name='lines-by-department'),
    path('department/<int:department_id>/lines/frontend/', TemplateView.as_view(template_name='index.html'), name='lines-by-department-frontend'),
    path('line/<int:line_id>/sublines/', views.get_sublines_by_line, name='sublines-by-line'),
    path('line/<int:line_id>/sublines/frontend/', TemplateView.as_view(template_name='index.html'), name='sublines-by-line-frontend'),
    path('subline/<int:subline_id>/stations/', views.get_stations_by_subline, name='stations-by-subline'),
    path('subline/<int:subline_id>/stations/frontend/', TemplateView.as_view(template_name='index.html'), name='stations-by-subline-frontend'),
    path('department/<int:department_id>/stations/', views.get_stations_by_department, name='stations-by-department'),
    path('department/<int:department_id>/stations/frontend/', TemplateView.as_view(template_name='index.html'), name='stations-by-department-frontend'),
    path('line/<int:line_id>/stations/', views.get_stations_by_line, name='stations-by-line'),
    path('line/<int:line_id>/stations/frontend/', TemplateView.as_view(template_name='index.html'), name='stations-by-line-frontend'),
    path('fetch-departments/', views.get_all_departments, name='fetch-departments'),
    path('fetch-departments/frontend/', TemplateView.as_view(template_name='index.html'), name='fetch-departments-frontend'),
    path("handovers/employee/<str:emp_id>/", EmployeeHandoverView.as_view()),
    path("handovers/employee/<str:emp_id>/frontend/", TemplateView.as_view(template_name='index.html'), name='employee-handover-frontend'),
    path("hierarchy/by-department/", HierarchyByDepartmentView.as_view(), name="hierarchy-by-department"),
    path("hierarchy/by-department/frontend/", TemplateView.as_view(template_name='index.html'), name='hierarchy-by-department-frontend'),
    path('hierarchy-simple/', views.get_hierarchy_structures, name='get_hierarchy_structures'),
    path('hierarchy-simple/frontend/', TemplateView.as_view(template_name='index.html'), name='get-hierarchy-structures-frontend'),
    path("hierarchy/all-departments/", HierarchyAllDepartmentsView.as_view(), name="hierarchy-all-departments"),
    path("hierarchy/all-departments/frontend/", TemplateView.as_view(template_name='index.html'), name='hierarchy-all-departments-frontend'),
    path('production-plans/planning-data/', views.get_planning_data, name='planning-data'),
    path('production-plans/planning-data/frontend/', TemplateView.as_view(template_name='index.html'), name='planning-data-frontend'),
    path('trends/operators-required/', views.get_operators_required_trend, name='operators-required-trend'),
    path('trends/operators-required/frontend/', TemplateView.as_view(template_name='index.html'), name='operators-required-trend-frontend'),
    path('production-data/gap-analysis/', views.monthly_availability_analysis, name='monthly_availability_analysis'),
    path('production-data/gap-analysis/frontend/', TemplateView.as_view(template_name='index.html'), name='monthly-availability-analysis-frontend'),
    path('production-data/date-range-summary/', views.weekly_availability_summary, name='weekly_availability_summary'),
    path('production-data/date-range-summary/frontend/', TemplateView.as_view(template_name='index.html'), name='weekly-availability-summary-frontend'),

    # ---------------- Notifications API ----------------
    # These are function-based views, so the frontend path refers to the client-side route
    path('api/notifications/count/', notification_count, name='notification-count'),
    path('api/notifications/count/frontend/', TemplateView.as_view(template_name='index.html'), name='notification-count-frontend'),
    path('api/notifications/system/', create_system_notification, name='create-system-notification'),
    path('api/notifications/system/frontend/', TemplateView.as_view(template_name='index.html'), name='create-system-notification-frontend'),
    path('api/notifications/test/', create_test_notification, name='create-test-notification'),
    path('api/notifications/test/frontend/', TemplateView.as_view(template_name='index.html'), name='create-test-notification-frontend'),
    path('api/notifications/debug/', test_notifications, name='test-notifications'),
    path('api/notifications/debug/frontend/', TemplateView.as_view(template_name='index.html'), name='test-notifications-frontend'),
    path('api/notifications/trigger-employee/', trigger_employee_notification, name='trigger-employee-notification'),
    path('api/notifications/trigger-employee/frontend/', TemplateView.as_view(template_name='index.html'), name='trigger-employee-notification-frontend'),
    path('api/notifications/trigger-all-types/', trigger_all_notification_types, name='trigger-all-notification-types'),
    path('api/notifications/trigger-all-types/frontend/', TemplateView.as_view(template_name='index.html'), name='trigger-all-notification-types-frontend'),
    path('api/notifications/delete-all/', delete_all_notifications, name='delete-all-notifications'),
    path('api/notifications/delete-all/frontend/', TemplateView.as_view(template_name='index.html'), name='delete-all-notifications-frontend'),

    # ---------------- User Manual Docs ----------------
    path('api/usermanualdocs/', views.UserManualdocsListCreateView.as_view(), name='usermanualdocs-list-create'),
    path('api/usermanualdocs/frontend/', TemplateView.as_view(template_name='index.html'), name='usermanualdocs-list-create-frontend'),
    path('api/usermanualdocs/<int:pk>/', views.UserManualdocsDetailView.as_view(), name='usermanualdocs-detail'),
    path('api/usermanualdocs/<int:pk>/frontend/', TemplateView.as_view(template_name='index.html'), name='usermanualdocs-detail-frontend'),
    path('api/usermanualdocs/<int:doc_id>/view/', views.view_file, name='view-file'),
    path('api/usermanualdocs/<int:doc_id>/view/frontend/', TemplateView.as_view(template_name='index.html'), name='view-file-frontend'),
    path('api/usermanualdocs/<int:doc_id>/download/', views.download_file, name='download-file'),
    path('api/usermanualdocs/<int:doc_id>/download/frontend/', TemplateView.as_view(template_name='index.html'), name='download-file-frontend'),

    # ---------------- Training Attendance Management ----------------
    path('training-batches/active/', ActiveTrainingBatchListView.as_view(), name='active-training-batches'),
    path('training-batches/active/frontend/', TemplateView.as_view(template_name='index.html'), name='active-training-batches-frontend'),
    path('training-batches/past/', PastTrainingBatchListView.as_view(), name='past-training-batches'),
    path('training-batches/past/frontend/', TemplateView.as_view(template_name='index.html'), name='past-training-batches-frontend'),
    path('attendance-detail/<str:batch_id>/', BatchAttendanceDetailView.as_view(), name='batch-attendance-detail'),
    path('attendance-detail/<str:batch_id>/frontend/', TemplateView.as_view(template_name='index.html'), name='batch-attendance-detail-frontend'),
    path('attendances/', BulkAttendanceUpdateView.as_view(), name='bulk-attendance-update'),
    path('attendances/frontend/', TemplateView.as_view(template_name='index.html'), name='bulk-attendance-update-frontend'),
    path('batches/<str:batch_id>/complete/', CompleteTrainingBatchView.as_view(), name='complete-training-batch'),
    path('batches/<str:batch_id>/complete/frontend/', TemplateView.as_view(template_name='index.html'), name='complete-training-batch-frontend'),
    path('batch/<str:batch_id>/absentees/', AbsentUsersListView.as_view(), name='absent-users-list'),




     # Subtopics
    path('subtopics/by-day/<int:day_id>/', SubTopicsByDayView.as_view(), name='subtopics-by-day'),
    
    # Rescheduled Sessions
    path('rescheduled-sessions/', RescheduledSessionListView.as_view(), name='rescheduled-sessions-list'),
    path('rescheduled-sessions/create/', RescheduledSessionCreateView.as_view(), name='rescheduled-session-create'),
    path('rescheduled-sessions/<int:pk>/', RescheduledSessionDetailView.as_view(), name='rescheduled-session-detail'),
    path('rescheduled-sessions/mark-attendance/', MarkRescheduledAttendanceView.as_view(), name='mark-rescheduled-attendance'),
    path('batch/<str:batch_id>/rescheduled-sessions/', BatchRescheduledSessionsView.as_view(), name='batch-rescheduled-sessions'),
    path('reschedule-from-absent/', RescheduleFromAbsentView.as_view(), name='reschedule-from-absent'),
    # =================== TrainingAttendance End ============================= #


    #================================management review================================
    path('current-month/training-data/', CurrentMonthTrainingDataView.as_view(), name='current-month-training-data'),
    path('current-month/defects-data/', CurrentMonthDefectsDataView.as_view(), name='current-month-defects-data'),
    path('chart/internal-rejection/', InternalRejectionChartView.as_view(), name='internal-rejection-chart'),
    path('chart/operators/', OperatorsChartView.as_view(), name='operators-chart'),
    path('chart/training-plans/', TrainingPlansChartView.as_view(), name='training-plans-chart'),
    path('chart/defects-msil/', DefectsChartView.as_view(), name='defects-msil-chart'),
    path('chart/tier1-defects/', Tier1DefectsChartView.as_view(), name='tier1-defects-chart'),
    path('management/download-template/', ManagementDownloadTemplateView.as_view(), name='management-download-template'),
    path('management/upload-excel/', ManagementUploadExcelView.as_view(), name='management-upload-excel'),
    path('chart/month-planning/', MonthPlanningChartView.as_view(), name='month-planning-chart'),
    path('chart/gca-defects/', GcaDefectsChartView.as_view(), name='gca-defects-chart'),


    #=========================================== Advance Manpower ==================================

    path('chart/advanced-manpower-trend/', AdvancedManpowerTrendChartView.as_view(), name='advanced-manpower-trend'),
    path('chart/attrition-trend/', AttritionChartView.as_view(), name='attrition-trend'),
    path('chart/buffer-manpower-trend/', BufferManpowerChartView.as_view(), name='buffer-manpower-trend'),
    path('chart/absenteeism-trend/', AbsenteeismChartView.as_view(), name='absenteeism-trend'),
    path('chart/bifurcation-stats/', BifurcationStatsView.as_view(), name='bifurcation-stats'),
    path('chart/advance-card-stats/', AdvanceCardStatsView.as_view(), name='advance-card-stats'),
    

    
    # ---------------- Employee Data ----------------
    path('employee-card-details/', EmployeeCardDetailsView.as_view(), name='employee-card-details'),
    path('employee-card-details/frontend/', TemplateView.as_view(template_name='index.html'), name='employee-card-details-frontend'),
    path("employee-skill-search/", EmployeeSkillSearch.as_view(), name="employee-skill-search"),
    path("employee-skill-search/frontend/", TemplateView.as_view(template_name='index.html'), name='employee-skill-search-frontend'),
    path('employee-report/', EmployeeReportPDFView.as_view(), name='employee-report'),
    path('employee-report/frontend/', TemplateView.as_view(template_name='index.html'), name='employee-report-frontend'),



    # path('upload-review/', ManagementReviewUploadAPIView.as_view(), name='upload_management_review_api'),
    # path('upload-review/frontend/', TemplateView.as_view(template_name='index.html'), name='upload-review-frontend'),
    # path('download-sample/', download_sample_excel, name='download_sample_excel'),


    
    path('hierarchy/<int:hierarchy_id>/skill-matrix-template/', SpecificHierarchyExcelHandlerView.as_view(), name='specific-hierarchy-excel'),
    path('hierarchy/<int:hierarchy_id>/skill-matrix-template/frontend/', TemplateView.as_view(template_name='index.html'), name='specific-hierarchy-excel-frontend'),

    path('skill-matrix-excel-handler/', SkillMatrixExcelHandlerView.as_view(), name='skill-matrix-excel-handler'),
    path('skill-matrix-excel-handler/frontend/', TemplateView.as_view(template_name='index.html'), name='skill-matrix-excel-handler-frontend'),

    path('skill-matrix/report/download/', SkillMatrixExcelView.as_view(), name='skill_matrix_report_download'),
    path('skill-matrix/report/download/frontend/', TemplateView.as_view(template_name='index.html'), name='skill_matrix_report_download-frontend'),


    
    path('api/answersheet/<int:score_id>/', views.AnswerSheetView.as_view(), name='answer-sheet-detail'),
    path('api/answersheet/<int:score_id>/frontend/', TemplateView.as_view(template_name='index.html'), name='answer-sheet-detail-frontend'),


    # path('api/results/matrix/<int:level_id>/<int:station_id>/', views.LevelStationMatrixView.as_view(), name='results-matrix'),
    # path('api/results/matrix/<int:level_id>/<int:station_id>/frontend/', TemplateView.as_view(template_name='index.html'), name='results-matrix-frontend'),
    
    #  ==================== for handover ===================
    path(
        'mastertable-handover-details/<str:emp_id>/', 
        views.get_mastertable_details_for_handover, 
        name='mastertable-handover-details'
    ),

    # Add a new path for this view.
    path('mastertable-ui-list/', views.get_mastertable_list_for_ui, name='mastertable-ui-list'),

    path('handover-page-data/', views.get_passed_scores_with_details, name='handover-page-data'),
    # ============= end =========================== 
    
    #Biometric realtime

    #Biometric realtime
    # -- Numax easytimepro start--
    path('api/attendance-logs/', AttendanceLogView.as_view(), name='attendance-logs'),
    path('api/daily-summary/', DailySummaryView.as_view(),), # Daily summary view
    path('api/operator-history/', OperatorHistoryView.as_view(), name='operator-history'),
    # -- Numax easytimepro end--

    #Biometric Attendance
    path('bioattendance/upload-excel/', ExcelUploadView.as_view(), name='excel-upload'), 
    path('set-task-time/attendance/', SetAttendanceTaskTimeView.as_view()),##################################
    path('biometric-attendance/summary/', MonthlySummaryView.as_view(), name='monthly-summary'),
    path('biometric-attendance/employee-detail/', EmployeeMonthlyDetailView.as_view()),
    path('system-settings/', SystemSettingsView.as_view(), name='system-settings'),
    path('validate-path/', ValidatePathView.as_view(), name='validate-path'),


    # path('api/answersheet/<str:session_name>/<str:employee_id>/', AnswerSheetView.as_view(), name='answer-sheet-detail'),
    # path('api/answersheet/<int:score_id>/', views.AnswerSheetView.as_view(), name='answer-sheet-detail'),
    
    path('api/results/matrix/<int:level_id>/<int:station_id>/', views.LevelStationMatrixView.as_view(), name='results-matrix'),

    path('api/results/matrix/excel/<int:level_id>/<int:station_id>/', ResultsMatrixExcelView.as_view(), name='results-matrix-excel'),



    path('evaluation-type/by-params/', EvaluationTypeMaxAttemptView.as_view(), name='evaluation-type-by-params'),

    
    path('chart/bifurcation-statslive/', bifurcation_stats_view, name='bifurcation_stats'),
    path('chart/total-stats/', total_manpower_stats_view, name='total_manpower_stats'),
    path('chart/absenteeism-trendlive/', AbsenteeismTrendView.as_view(), name='absenteeism-trend'),
    path('chart/current-stats/', views.current_manpower_card_view, name='current-manpower-stats'),
    
    path('api/actions/', ActionItemListCreateView.as_view(), name='action-list'),
    path('api/actions/<int:pk>/', ActionItemDetailView.as_view(), name='action-detail'),


    path('api/actionsrejection/', ActionItemRejectionListCreateView.as_view(), name='action-list'),
    path('api/actionsrejection/<int:pk>/', ActionItemRejectionDetailView.as_view(), name='action-detail'),



    path('', include(router.urls)),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# from django.urls import path, include, re_path
# from . import views
# from rest_framework_simplejwt.views import TokenRefreshView

# from django.conf import settings
# from django.conf.urls.static import static
# from django.views.generic import TemplateView



# from rest_framework.routers import DefaultRouter
# from .views import ARVRTrainingContentViewSet, ActiveTrainingBatchListView, BatchAttendanceDetailView, AdvanceManpowerDashboardViewSet, BodyCheckSubmissionView, BulkAttendanceUpdateView, CompanyLogoViewSet, CompleteTrainingBatchView, CurrentMonthDefectsDataView, CurrentMonthTrainingDataView,  CurriculumContentViewSet, CurriculumViewSet, DailyProductionDataViewSet, DaysViewSet, DefectsChartView, DepartmentStationViewSet, DepartmentSubLineViewSet, EmployeeAttendanceViewSet, EmployeeCardDetailsView, EmployeeExcelViewSet, EmployeeHandoverView, EmployeeReportPDFView, EmployeeSkillSearch, EvaluationViewSet, FeatureFlagViewSet, HanContentViewSet, HanSubtopicViewSet, HanTrainingContentViewSet, HanchouExamQuestionViewSet, HanchouExamResultViewSet, HanchouResultCertificatePDF, HandoverSheetViewSet, HierarchyAllDepartmentsView, HierarchyByDepartmentView, HierarchyStructureViewSet,  HqViewSet, FactoryViewSet, DepartmentViewSet, HumanBodyQuestionsViewSet, KeyEventCreateView, LatestKeyEventView, Level2QuantityOJTEvaluationViewSet, LevelColourViewSet, LevelOnePassedUsersView, LevelViewSet, LevelWiseTrainingContentViewSet, LineViewSet, MachineAllocationApprovalViewSet, MachineAllocationViewSet, MachineViewSet, ManagementReviewViewSet, MasterTableViewSet, MultiSkillingViewSet, NotificationViewSet, OJTDayListView, OJTDayViewSet, OJTLevel2QuantityViewSet, OJTPassingCriteriaViewSet, OJTScoreRangeViewSet, OJTScoreViewSet, OJTTopicListView, OJTTopicViewSet, PastTrainingBatchListView, OperatorsChartView,  ProductionPlanViewSet, QuantityOJTScoreRangeViewSet, QuantityPassingCriteriaViewSet, QuestionPaperViewSet, RescheduleLogViewSet, RetrainingConfigViewSet, RetrainingSessionViewSet, RoleViewSet, ScheduleViewSet, ShoContentViewSet, ShoSubtopicViewSet, ShoTrainingContentViewSet, ShokuchouExamQuestionViewSet, ShokuchouExamResultViewSet, ShokuchouResultCertificatePDF, SkillMatrixDisplaySettingViewSet, SkillMatrixViewSet, StationLevelQuestionPaperViewSet, StationManagerViewSet, StationSettingCreateView, SubLineViewSet, StationViewSet, SubTopicContentViewSet, SubTopicViewSet, SubmitWebTestAPIView, TemplateQuestionViewSet,  TraineeInfoListView, TraineeInfoViewSet, Trainer_nameViewSet, Training_categoryViewSet, TrainingContentViewSet, TrainingPlansChartView, TrainingTopicViewSet, UserBodyCheckListView, UserRegistrationViewSet, UserViewSet, VenueViewSet, create_system_notification, create_test_notification, delete_all_notifications, notification_count, serve_han_material_file, serve_sho_material_file,EvaluationPassingCriteriaViewSet, test_notifications, trigger_all_notification_types, trigger_employee_notification
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     TenCycleDayConfigurationViewSet,
#     TenCycleTopicsViewSet,
#     TenCycleSubTopicViewSet,
#     TenCyclePassingCriteriaViewSet,
#     OperatorPerformanceEvaluationViewSet,
#     EvaluationSubTopicMarksViewSet,TenCycleConfigurationViewSet,get_station_requirements,dojo_app
# )



# router = DefaultRouter()
# router.register(r'hq', HqViewSet, basename='hq')
# router.register(r'factories', FactoryViewSet, basename='factory')
# router.register(r'departments', DepartmentViewSet, basename='department')
# router.register(r'lines', LineViewSet, basename='line')
# router.register(r'sublines', SubLineViewSet, basename='subline')
# router.register(r'stations', StationViewSet, basename='station')
# router.register(r'hierarchy-structures', HierarchyStructureViewSet, basename='hierarchy-structure')


# #10 cycle

# router.register(r'tencycle-days', TenCycleDayConfigurationViewSet, basename='tencycle-day')
# router.register(r'tencycle-topics', TenCycleTopicsViewSet, basename='tencycle-topic')
# router.register(r'tencycle-subtopics', TenCycleSubTopicViewSet, basename='tencycle-subtopic')
# router.register(r'tencycle-passingcriteria', TenCyclePassingCriteriaViewSet, basename='tencycle-passingcriteria')
# router.register(r'operator-evaluations', OperatorPerformanceEvaluationViewSet, basename='operator-evaluation')
# router.register(r'evaluation-marks', EvaluationSubTopicMarksViewSet, basename='evaluation-mark')
# router.register(r'tencycle-configuration', TenCycleConfigurationViewSet, basename='tencycle-configuration')


# router.register(r'levels', LevelViewSet)
# router.register(r'days', DaysViewSet)
# router.register(r'subtopics', SubTopicViewSet)
# router.register(r'subtopic-contents', SubTopicContentViewSet)
# router.register(r'training-contents', TrainingContentViewSet)
# router.register(r'evaluations', EvaluationViewSet)
# router.register(r'mastertable', MasterTableViewSet, basename='mastertable')
# router.register(r'humanbody-questions', HumanBodyQuestionsViewSet, basename='humanbody-questions')
# router.register(r'production-plans', ProductionPlanViewSet, basename='production-plan')

# router.register(r'machines', MachineViewSet, basename='machines')
# router.register(r'allocations', MachineAllocationViewSet, basename='allocations')

# router.register(r'machine-allocation-approval', MachineAllocationApprovalViewSet, basename='machineallocationapproval')


# router.register(r'questionpapers', QuestionPaperViewSet, basename='questionpaper')
# router.register(r'station-level-questionpapers', StationLevelQuestionPaperViewSet, basename='stationlevelquestionpaper')
# router.register(r'arvr-content', ARVRTrainingContentViewSet, basename='arvr-content')




# router.register(r'template-questions', TemplateQuestionViewSet, basename='templatequestion')


# # hanshou & shokuchou 

# router.register(r'hanchou-questions', HanchouExamQuestionViewSet, basename='hanchou-questions')
# router.register(r"hanchou/results", HanchouExamResultViewSet, basename="hanchou-results")

# router.register(r"shokuchou-questions", ShokuchouExamQuestionViewSet, basename="shokuchou-questions")
# router.register(r"shokuchou/results", ShokuchouExamResultViewSet, basename="shokuchou-results")


# router.register(r'han-content', HanContentViewSet, basename='han-content')
# router.register(r'han-subtopics', HanSubtopicViewSet,  basename='han-subtopic') 
# router.register(r'han-materials', HanTrainingContentViewSet, basename='han-material')

# router.register(r'sho-content', ShoContentViewSet, basename='sho-content')
# router.register(r'sho-subtopics', ShoSubtopicViewSet, basename='sho-subtopic')
# router.register(r'sho-materials', ShoTrainingContentViewSet, basename='sho-material')




# router.register(r'ojt-topics', OJTTopicViewSet, basename='ojt-topic')
# router.register(r'ojt-days', OJTDayViewSet, basename='ojt-day')
# router.register(r'ojt-score-ranges', OJTScoreRangeViewSet, basename='ojt-scorerange')
# router.register(r'ojt-scores', OJTScoreViewSet)
# router.register(r'ojt-passing-criteria', OJTPassingCriteriaViewSet)
# router.register(r'trainees', TraineeInfoViewSet, basename='trainees')
# router.register(r"ojt-quantity", OJTLevel2QuantityViewSet)


# # Refreshment Training
# router.register(r'training-categories', Training_categoryViewSet)
# router.register(r'curriculums', CurriculumViewSet, basename='curriculum')
# router.register(r'curriculum-contents', CurriculumContentViewSet, basename='curriculumcontent')
# router.register(r'trainer_name', Trainer_nameViewSet)
# router.register(r'venues', VenueViewSet)
# router.register(r'schedules', ScheduleViewSet)
# router.register(r'attendances', EmployeeAttendanceViewSet, basename='attendance')
# router.register(r'reschedule-logs', RescheduleLogViewSet, basename='reschedulelog')


# router.register(r"score-ranges", QuantityOJTScoreRangeViewSet, basename="quantity-score-range")
# router.register(r"passing-criteria", QuantityPassingCriteriaViewSet, basename="quantity-passing-criteria")
# router.register(r"ojt-evaluations", Level2QuantityOJTEvaluationViewSet)


# router.register(r'logos', CompanyLogoViewSet)
# router.register(r'evaluation-passing-criteria', EvaluationPassingCriteriaViewSet, basename='evaluation-passing-criteria')



# router.register(r'retraining-sessions', RetrainingSessionViewSet, basename='retraining-session')
# router.register(r'retraining-configs', RetrainingConfigViewSet, basename='retraining-config')
# router.register(r'notifications', NotificationViewSet, basename='notifications')

# router.register(r'levelcolours', LevelColourViewSet, basename="levelcolours")
# router.register(r'displaysetting', SkillMatrixDisplaySettingViewSet, basename='displaysetting')

# router.register(r'department-sublines', DepartmentSubLineViewSet, basename='department-sublines')
# router.register(r'department-stations', DepartmentStationViewSet, basename='department-stations')


# router.register(r"users", UserViewSet, basename="user")
# router.register(r'roles', RoleViewSet, basename='role')

# router.register(r'handovers', HandoverSheetViewSet, basename='handover')

# router.register(r'production-data', DailyProductionDataViewSet, basename='productiondata')

# router.register( r"training_topics", TrainingTopicViewSet, basename="training_topic")
# router.register(r"levelwise-training-contents", LevelWiseTrainingContentViewSet, basename="levelwisetrainingcontent")

# router.register(r"skill-matrix", SkillMatrixViewSet, basename="skill-matrix")



# router.register(r'advance-dashboard', AdvanceManpowerDashboardViewSet, basename='advance-dashboard')
# router.register(r'management-reviews', ManagementReviewViewSet, basename='managementreview')


# router.register(r'employees-excel', EmployeeExcelViewSet, basename='employee-excel')


# router.register(r"multiskilling", MultiSkillingViewSet, basename="multiskilling")

# router.register(r"feature-flags", FeatureFlagViewSet, basename="feature-flags")




# router.register(r'station-managers', StationManagerViewSet, basename='station-manager')


# urlpatterns = [
    
#     path('', dojo_app, name='dojo-app'),  # Normal path

#     path('', TemplateView.as_view(template_name='index.html'), name='root-frontend'),  # TemplateView path

#     path('home/', TemplateView.as_view(template_name='index.html'), name='home-frontend'),  # Existing TemplateView path

#     # ---------------- Auth ----------------
#     path('register/', views.RegisterView.as_view(), name="register"),
#     path('register/frontend/', TemplateView.as_view(template_name='index.html'), name="register-frontend"),

#     path('login/', views.LoginAPIView.as_view(), name='login'),
#     path('login/frontend/', TemplateView.as_view(template_name='index.html'), name='login-frontend'),

#     path('logout/', views.LogoutAPIView.as_view(), name="logout"),
#     path('logout/frontend/', TemplateView.as_view(template_name='index.html'), name="logout-frontend"),


#     # ---------------- JWT ----------------
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('api/token/refresh/frontend/', TemplateView.as_view(template_name='index.html'), name='token-refresh-frontend'),


#     # ---------------- Temp Users ----------------
#     path('temp-user-info/', UserRegistrationViewSet.as_view({'get': 'list', 'post': 'create'}), name='temp-user-info'),
#     path('temp-user-info/frontend/', TemplateView.as_view(template_name='index.html'), name='temp-user-info-frontend'),

#     path('users/<str:temp_id>/', UserRegistrationViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update'}), name='user-update'),
#     path('users/<str:temp_id>/frontend/', TemplateView.as_view(template_name='index.html'), name='user-update-frontend'),


#     # ---------------- Body Check ----------------
#     path('human-body-checks/', BodyCheckSubmissionView.as_view(), name='human-body-checks'),
#     path('human-body-checks/frontend/', TemplateView.as_view(template_name='index.html'), name='human-body-checks-frontend'),

#     path('user-body-checks/', UserBodyCheckListView.as_view(), name='user-body-checks'),
#     path('user-body-checks/frontend/', TemplateView.as_view(template_name='index.html'), name='user-body-checks-frontend'),


#     # ---------------- Materials ----------------
#     path('han-materials/<int:pk>/serve/', serve_han_material_file, name='serve-han-material-file'),
#     path('han-materials/<int:pk>/serve/frontend/', TemplateView.as_view(template_name='index.html'), name='serve-han-material-file-frontend'),

#     path('sho-materials/<int:pk>/serve/', serve_sho_material_file, name='serve-sho-material-file'),
#     path('sho-materials/<int:pk>/serve/frontend/', TemplateView.as_view(template_name='index.html'), name='serve-sho-material-file-frontend'),

#     # ---------------- Certificates ----------------
#     path('hanchou-results/<int:pk>/download-certificate/', HanchouResultCertificatePDF.as_view(), name='download-hanchou-certificate'),
#     path('hanchou-results/<int:pk>/download-certificate/frontend/', TemplateView.as_view(template_name='index.html'), name='download-hanchou-certificate-frontend'),

#     path('shokuchou-results/<int:pk>/download-certificate/', ShokuchouResultCertificatePDF.as_view(), name='download-shokuchou-certificate'),
#     path('shokuchou-results/<int:pk>/download-certificate/frontend/', TemplateView.as_view(template_name='index.html'), name='download-shokuchou-certificate-frontend'),


#     # ---------------- OJT ----------------
#     path('ojt-days-list/', OJTDayListView.as_view(), name="ojt-days-list"),
#     path('ojt-days-list/frontend/', TemplateView.as_view(template_name='index.html'), name="ojt-days-list-frontend"),

#     path('ojt-topics-list/', OJTTopicListView.as_view(), name="ojt-topics-list"),
#     path('ojt-topics-list/frontend/', TemplateView.as_view(template_name='index.html'), name="ojt-topics-list-frontend"),

#     path("trainee-info-list/", TraineeInfoListView.as_view(), name="trainee-info-list"),
#     path("trainee-info-list/frontend/", TemplateView.as_view(template_name='index.html'), name="trainee-info-list-frontend"),


#     # ---------------- Station ----------------
#     path('station-settings/', StationSettingCreateView.as_view(), name='station-setting-create'),
#     path('station-settings/frontend/', TemplateView.as_view(template_name='index.html'), name='station-setting-create-frontend'),

#     # ---------------- Test Session ----------------
#     path('start-test/', views.StartTestSessionView.as_view(), name='start_test_session'),
#     path('start-test/frontend/', TemplateView.as_view(template_name='index.html'), name='start_test_session-frontend'),

#     path('api/end-test/', views.EndTestSessionView.as_view(), name='end_test_session'),
#     path('api/end-test/frontend/', TemplateView.as_view(template_name='index.html'), name='end_test_session-frontend'),

#     path('api/scores/', views.ScoreListView.as_view(), name='score_list'),
#     path('api/scores/frontend/', TemplateView.as_view(template_name='index.html'), name='score_list-frontend'),

#     path('api/test-session/map/', views.KeyIdToEmployeeNameMap.as_view(), name='keyid-name-map'),
#     path('api/test-session/map/frontend/', TemplateView.as_view(template_name='index.html'), name='keyid-name-map-frontend'),

#     path('api/past-sessions/', views.PastTestSessionsView.as_view()),
#     path('api/past-sessions/frontend/', TemplateView.as_view(template_name='index.html'), name='past-sessions-frontend'),

#     path('api/scores-by-session/<str:name>/', views.ScoresByTestView.as_view()),
#     path('api/scores-by-session/<str:name>/frontend/', TemplateView.as_view(template_name='index.html'), name='scores-by-session-frontend'),

#     path('api/score-summary/', views.ResultSummaryAPIView.as_view(), name='score-summary'),
#     path('api/score-summary/frontend/', TemplateView.as_view(template_name='index.html'), name='score-summary-frontend'),

#     path('api/skills/', views.SkillListView.as_view(), name='skill-list'),
#     path('api/skills/frontend/', TemplateView.as_view(template_name='index.html'), name='skill-list-frontend'),

#     path('submit-web-test/', SubmitWebTestAPIView.as_view(), name='submit-web-test'),
#     path('submit-web-test/frontend/', TemplateView.as_view(template_name='index.html'), name='submit-web-test-frontend'),


#     # ---------------- Charts Example ----------------
#     path('chart/defects-msil/', DefectsChartView.as_view(), name='defects-msil-chart'),
#     path('chart/defects-msil/frontend/', TemplateView.as_view(template_name='index.html'), name='defects-msil-chart-frontend'),

#     path('', include(router.urls)),

# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    
