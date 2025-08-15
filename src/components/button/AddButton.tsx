import React, { useState, ReactNode } from 'react';
import ButtonCustom from "@/components/ui/Button";
import { IoMdAdd } from 'react-icons/io';
import Modal from "@/components/Modal";

type AddButtonProps = {
  label?: string;
  children: ReactNode;
  modalTitle?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  className?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
};

const AddButton: React.FC<AddButtonProps> = ({
  label,
  children,
  modalTitle,
  open,
  setOpen,
  className,
  showDeleteButton = false,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
 

  // Use external state if provided, otherwise internal state
  const modalOpen = open !== undefined ? open : isModalOpen;
  const handleOpen = () => (setOpen ? setOpen(true) : setIsModalOpen(true));
  const handleClose = () => (setOpen ? setOpen(false) : setIsModalOpen(false));

  return (
    <>
      <ButtonCustom
        onClick={handleOpen}
        label="Add"
        icon={<IoMdAdd />}
        className="primary-button mt-4 gap-0 rounded-md px-2 "
      />
      {showDeleteButton && (
        <ButtonCustom
          onClick={onDelete}
          label="Delete"
          icon={<IoMdAdd />}
          className="primary-button mt-4 gap-0 rounded-md px-2 bg-[#FF1515] "
        />
      )}
      <Modal
        isOpen={modalOpen}
        onClose={handleClose}
        title={modalTitle}
        className={className}
      >
        {children}
      </Modal>
    </>
  );
};

export default AddButton;
