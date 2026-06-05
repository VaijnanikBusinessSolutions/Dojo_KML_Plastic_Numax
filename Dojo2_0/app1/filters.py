# your_app/filters.py

import django_filters
from django.db.models import Q
# Make sure to import HierarchyStructure and all your other models
from .models import QuestionPaper, Department, Line, SubLine, Station, Level, HierarchyStructure

class QuestionPaperFilter(django_filters.FilterSet):
    station = django_filters.NumberFilter(method='filter_by_station_hierarchy')

    class Meta:
        model = QuestionPaper
        fields = ['level', 'department']

    def filter_by_station_hierarchy(self, queryset, name, value):
        """
        This NEW version finds a station's parents by querying the
        HierarchyStructure model, instead of relying on foreign keys
        on the Station model itself.
        """
        print(f"\n===== NEW HIERARCHYSTRUCTURE FILTER FOR STATION ID: {value} =====")

        # 1. Find the station's hierarchy entry in the HierarchyStructure table.
        #    We use 'value' which is the station_id passed in the URL.
        try:
            # Find the first valid hierarchy path for the given station.
            # A station might appear in multiple structures, but its parentage should be consistent.
            structure_entry = HierarchyStructure.objects.filter(station_id=value).first()
            
            if not structure_entry:
                raise HierarchyStructure.DoesNotExist

        except HierarchyStructure.DoesNotExist:
            print(f"DEBUG: No entry found in HierarchyStructure for station_id={value}. Can't find parents.")
            print("===============================================================\n")
            # If the station isn't in the structure table, we can only find papers assigned directly to it.
            return queryset.filter(station_id=value)

        # 2. Extract the parent objects from the found structure entry.
        parent_department = structure_entry.department
        parent_line = structure_entry.line
        parent_subline = structure_entry.subline

        print(f"DEBUG: Found via HierarchyStructure:")
        print(f"  - Parent Department: '{parent_department}' (ID: {getattr(parent_department, 'pk', 'N/A')})")
        print(f"  - Parent Line: '{parent_line}' (ID: {getattr(parent_line, 'pk', 'N/A')})")
        print(f"  - Parent Subline: '{parent_subline}' (ID: {getattr(parent_subline, 'pk', 'N/A')})")

        # 3. Build the hierarchical query using Q objects (this part remains the same logic)
        
        # Match papers assigned directly to this specific station.
        station_specific_match = Q(station_id=value)

        # The rest of the Q objects depend on whether the parents were found
        if parent_department:
            department_level_match = Q(station__isnull=True, subline__isnull=True, line__isnull=True, department=parent_department)
        else:
            department_level_match = Q() # An empty Q object that matches nothing

        if parent_line:
            line_level_match = Q(station__isnull=True, subline__isnull=True, line=parent_line)
        else:
            line_level_match = Q()

        if parent_subline:
            subline_level_match = Q(station__isnull=True, subline=parent_subline)
        else:
            subline_level_match = Q()

        # Combine all conditions with an OR operator ('|').
        combined_q_filter = (
            station_specific_match |
            subline_level_match |
            line_level_match |
            department_level_match
        )
        
        print(f"DEBUG: Applying combined Q filter: {combined_q_filter}")
        print("===============================================================\n")
        
        return queryset.filter(combined_q_filter)