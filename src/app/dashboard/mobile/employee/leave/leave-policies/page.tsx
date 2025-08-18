"use client";
import AddButton from "@/components/button/AddButton";
import InfoCard from "@/components/card/InfoCard";
import ButtonCustom from "@/components/ui/Button";
import {
  createLeaveType,
  deleteLeaveType,
  fetchAllLeaveTypes,
  updateLeaveType,
} from "@/lib/api/leave";
import {
  DatePickerProps,
  Input,
  InputNumber,
  InputNumberProps,
  message,
} from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { toast } from "sonner";

const Page = () => {
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
  const [leavePolicies, setLeavePolicies] = useState<any[]>([]);
  const [selectedLeavePoliciesId, setSelectedLeavePoliciesId] = useState<
    number | null
  >(null);
  const [isEditPoliciesEnabled, setIsEditPoliciesEnabled] = useState(false);

  const [loading, setLoading] = useState(false);

  const [policyForm, setPolicyForm] = useState({
  type_name: "",
  prefix: "",
  description: "",
  max_days: null as number | null, 
});
  const handleDeletePolicy = async () => {
    if (!selectedLeavePoliciesId) {
      message.error("No department selected to delete.");
      return;
    }
    try {
      await deleteLeaveType(selectedLeavePoliciesId);
      message.success("Department deleted!");

      fetchAllLeaveTypes().then((data) => setLeavePolicies(data));
      setSelectedLeavePoliciesId(null);
      setIsEditPoliciesEnabled(false);
      setIsPoliciesModalOpen(false);
    } catch (err) {
      message.error("Failed to delete department");
    }
  };
  useEffect(() => {
    fetchAllLeaveTypes().then((data) => {
      setLeavePolicies(data);
    });
  }, []);

  const handlePolicyChange = (field: string, value: string | number | null) => {
    setPolicyForm((prev) => ({ ...prev, [field]: value }));
};

  const closeShiftTimeModal = () => {
    setIsPoliciesModalOpen(false);

  };

  const handlePublish = async () => {
    if (!policyForm.type_name || !policyForm.max_days) {
      message.error("Type name and max days are required");
      return;
    }
    setLoading(true);

    const payload = {
        type_name: policyForm.type_name,
        prefix: policyForm.prefix,
        description: policyForm.description,
        max_days: policyForm.max_days, 
    };

    try {
      if (isEditPoliciesEnabled && selectedLeavePoliciesId) {
        await updateLeaveType( selectedLeavePoliciesId, payload );
        message.success("Leave policies updated!");
      } else {
        await createLeaveType(payload);
        toast.success("Leave policies created successfully");
      }
      setPolicyForm({
        type_name: "",
        prefix: "",
        description: "",
        max_days: null,
      });

      // Refresh list
      setLoading(false);
      fetchAllLeaveTypes().then((data) => setLeavePolicies(data));
      closeShiftTimeModal();
    } catch (err: any) {
      // Check for duplicate type_name error
      if (
        err?.response?.data?.exception?.message?.includes(
          "has already been taken"
        )
      ) {
        toast.error(
          "This type name already exists. Please use a different name."
        );
      } else {
        toast.error("Failed to create leave policy");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-shadow flex flex-col gap-4">
      <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
        Leave Policies
      </h1>
      <div className="flex flex-col items-end">
        <Input
          className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663] mt-2"
          placeholder="Search..."
          prefix={<CiSearch className="text-[#364663] text-xl" />}
        />
        <AddButton
          modalTitle={
            isEditPoliciesEnabled ? "Update Leave Policy" : "Add Leave Policy"
          }
          label={
            isEditPoliciesEnabled ? "Update Leave Policy" : "Add Leave Policy"
          }
          open={isPoliciesModalOpen}
          className="mb-20"
          showDeleteButton={isEditPoliciesEnabled}
          onDelete={handleDeletePolicy}
          setOpen={(open) => {
            if (open) {
              if (isEditPoliciesEnabled && selectedLeavePoliciesId) {
                const selectedPolicy = leavePolicies.find(
                  (d) => d.id === selectedLeavePoliciesId
                );
                if (selectedPolicy) {
          setPolicyForm({
            type_name: selectedPolicy.type_name,
            prefix: selectedPolicy.prefix,
            max_days: selectedPolicy.max_days,
            description: selectedPolicy.description || "",
          });
        }
      } else {
        setPolicyForm({
          type_name: "",
          prefix: "",
          description: "",
          max_days: null,
        });
      }
            }
            setIsPoliciesModalOpen(open);
          }}
        >
          <div className="bg-shadow p-4">
            <label htmlFor="leave-type">Type name</label>
            <div className="flex flex-col gap-4 mt-4">
              <Input
                value={policyForm.type_name}
                placeholder="Type Name"
                onChange={(e) =>
                  handlePolicyChange("type_name", e.target.value)
                }
                className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
              />
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <label htmlFor="leave-type">Prefix</label>
              <Input
                value={policyForm.prefix}
                onChange={(e) =>
                  handlePolicyChange("prefix", e.target.value)
                }
                placeholder="Type Name"
                className="!stroke-none bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
              />
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <label htmlFor="leave-type">Max Days</label>
              <InputNumber
                value={policyForm.max_days}
                onChange={(value) => handlePolicyChange("max_days", value)}
                className="w-full py-1.5"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="leave-type">Description</label>
              <TextArea
                className="mt-4  
                        bg-[rgba(150,166,194,0.2)] w-full rounded-[10px] text-[#364663]"
                showCount
                value={policyForm.description}
                maxLength={100}
                onChange={(e) =>
                  handlePolicyChange("description", e.target.value)
                }
                placeholder="Enter description..."
              />
            </div>
          </div>
          <ButtonCustom
            label={loading ? "Publishing..." : "Publish"}
            className="primary-button mt-4 px-5 float-right"
            type="submit"
            onClick={handlePublish}
            disabled={loading}
          />
        </AddButton>
      </div>
      {leavePolicies.map((leavePolicy) => (
        <InfoCard
          key={leavePolicy.id}
          code={leavePolicy.prefix}
          name={leavePolicy.type_name}
          isSelected={selectedLeavePoliciesId === leavePolicy.id}
          onClick={() => {
            if (selectedLeavePoliciesId === leavePolicy.id) {
              setSelectedLeavePoliciesId(null);
              setIsEditPoliciesEnabled(false);
            } else {
              setSelectedLeavePoliciesId(leavePolicy.id);
              setIsEditPoliciesEnabled(true);
            }
          }}
          description={leavePolicy.description}
        />
      ))}
      {/* <Modal
        isOpen={}
        onClose={closeShiftTimeModal}
        title="Add Leave Policy"
        className="px-4"
      >
        
      </Modal> */}
    </div>
  );
};

export default Page;
