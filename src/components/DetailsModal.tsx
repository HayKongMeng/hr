import React from "react";
import { HiXMark } from "react-icons/hi2";
import moment from "moment";

interface Leave {
    id: number;
    employee_id: number;
    reason: string;
    start_date: string;
    end_date: string;
    status: {
        status_name: string;
    };
    leave_type: {
        id: number;
        type_name: string;
    }
}

type DetailsModalProps = {
    leaves: Leave[];
    selectedEmployeeId: number | null;
    selectedStatus: string | null;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const DetailsModal: React.FC<DetailsModalProps> = ({
    leaves,
    selectedEmployeeId,
    selectedStatus,
    setShowModal,
}) => {
    if (!selectedEmployeeId || !selectedStatus) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-auto">
            <div className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white rounded-[24px] border shadow-lg transition-all duration-300 transform animate-modal-popin max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b p-6">
                    <h1 className="text-lg font-bold text-gray-900 capitalize">
                        {selectedStatus} Leaves Detail
                    </h1>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => setShowModal(false)}
                        className="p-0.5 rounded-full bg-gray-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <HiXMark size={15} className="text-white" />
                    </button>
                </div>
            
                <div className="p-6">
                    <table className="min-w-full text-sm border-gray-200">
                        <thead className="bg-gray-100 sticky top-0 py-4 px-4 text-xs border-b uppercase">
                            <tr>
                                <th className="px-4 py-2 border-b text-left">Leave Type</th>
                                <th className="px-4 py-2 border-b text-left">Leave Date</th>
                                <th className="px-4 py-2 border-b text-left">Leave Days</th>
                                <th className="px-4 py-2 border-b text-left">Leave Reason</th>
                            </tr>
                        </thead>
                        <tbody className="max-h-60 overflow-y-auto">
                            {leaves
                            .filter(
                                (leave) =>
                                leave.employee_id === selectedEmployeeId &&
                                leave.status.status_name.toLowerCase() === selectedStatus.toLowerCase()
                            )
                            .map((leave) => (
                                <tr key={leave.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border-b">{leave.leave_type.type_name}</td>
                                    <td className="px-4 py-2 border-b">{leave.start_date} to {leave.end_date}</td>
                                    <td className="px-4 py-2 border-b">{moment(leave.end_date).diff(moment(leave.start_date), 'days') + 1}</td>
                                    <td className="px-4 py-2 border-b">{leave.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>       
                </div>
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 pb-4 pr-6 pl-6 border-t"> 
                     <button
                        onClick={() => setShowModal(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-[24px]"
                    >
                        Close
                    </button>
                </div> 
            </div>
        </div>
    );
};

export default DetailsModal;
