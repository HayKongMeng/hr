import ChipInput from "@/components/ChipInput";
import React from "react";
import ButtonCustom from "@/components/ui/Button";

const Page = () => {
  return (
    <div>
      <h1 className="text-[20px] font-medium tracking-[-0.5px] font-satoshi leading-[17px]">
        Manage Roles
      </h1>
      <section className="bg-shadow p-4 flex flex-col gap-4">
        <div>
            <label htmlFor="leave-type">Admin</label>
        <ChipInput/>
        </div>
        <div>
            <label htmlFor="leave-type">Employee</label>
        <ChipInput/>
        </div>
      </section>
      <ButtonCustom
          label="Save"
          className="primary-button mt-4 px-5 float-right"
          type="submit"
        />
    </div>
  );
};
     
export default Page;
