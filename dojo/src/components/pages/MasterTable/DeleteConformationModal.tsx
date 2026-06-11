import { useState } from "react";
import type { Employee } from "../../../constants/types";
import { Button } from "../../atoms/Buttons/Button";

interface DeleteConfirmationModalProps {
    employee: Employee;
    step: number;
    onClose: () => void;
    onConfirmStep1: () => void;
    onConfirmFinal: (deleteBiometric: boolean) => Promise<void>;
}

const Step1Content = ({ employee, onClose, onConfirmStep1 }: Pick<DeleteConfirmationModalProps, "employee" | "onClose" | "onConfirmStep1">) => (
    <>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">Confirm Deletion</h3>
        <p className="mt-2 text-md text-gray-600 text-center">
            Are you sure you want to delete <strong className="text-purple-700">{`${employee.first_name} ${employee.last_name}`}</strong>?
        </p>
        <div className="mt-6 flex justify-center gap-4">
            <Button onClick={onClose} variant="secondary">Cancel</Button>
            <Button onClick={onConfirmStep1} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Yes, Continue
            </Button>
        </div>
    </>
);

const Step2Content = ({ employee, onClose, onConfirmFinal }: Pick<DeleteConfirmationModalProps, "employee" | "onClose" | "onConfirmFinal">) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteBiometric, setDeleteBiometric] = useState(false);

    const handleFinalConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirmFinal(deleteBiometric);
            // The parent will handle closing the modal on success
        } catch (err) {
            // Error is handled in the parent, but we must stop the loading state here
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold text-red-700 text-center">FINAL WARNING</h3>
            <div className="mt-3 text-center text-md text-gray-700 bg-red-50 p-4 rounded-lg border border-red-200">
                <p>Deleting <strong className="text-red-800">{`${employee.first_name} ${employee.last_name}`}</strong> is <strong className="font-extrabold">irreversible</strong>.</p>
                <p className="mt-2">All associated data, including OJT records, exam results, and cycle performance, will be <strong className="font-extrabold">permanently lost</strong>.</p>
            </div>
            
            {/* Biometric Deletion Checkbox (unchecked by default) */}
            <div className="mt-4 flex items-center justify-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <input
                    type="checkbox"
                    id="deleteBiometric"
                    checked={deleteBiometric}
                    onChange={(e) => setDeleteBiometric(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="deleteBiometric" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Also delete employee from Biometric Devices (EasyTime)
                </label>
            </div>

            <div className="mt-6 flex justify-center gap-4">
                <Button onClick={onClose} variant="secondary" disabled={isDeleting}>
                    Cancel
                </Button>
                <Button onClick={handleFinalConfirm} variant="danger" disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                </Button>
            </div>
        </>
    );
};


export const DeleteConfirmationModal = ({ employee, step, onClose, onConfirmStep1, onConfirmFinal }: DeleteConfirmationModalProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-fade-in-up">
                 {step === 1 && <Step1Content employee={employee} onClose={onClose} onConfirmStep1={onConfirmStep1} />}
                 {step === 2 && <Step2Content employee={employee} onClose={onClose} onConfirmFinal={onConfirmFinal} />}
            </div>
        </div>
    );
};