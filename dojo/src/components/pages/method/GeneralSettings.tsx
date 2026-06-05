import React from "react";
import CompanyLogoUpload from "../../molecules/CompanyLogoUpload/CompanyLogoUpload";

// import EmployeeAssignmentForm from "../Method/EmployeeAssignmentForm/EmployeeAssignmentForm";

const GeneralSettingsMethod: React.FC = () => {
    return (
        <div className="p-6  mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">General Settings </h1>
            <CompanyLogoUpload />
       


        </div>
    );
};

export default GeneralSettingsMethod;