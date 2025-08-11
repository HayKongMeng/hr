import Image from "next/image";

const Page = () => {
  return (
    <>
      <div className="mt-[19px] space-y-3">
        <div className="bg-[#F8F9FA] rounded-lg py-1.5 px-0 flex items-center justify-between">
          <div className="flex items-start gap-2">
                <Image src={"/profile.png"} alt="profile" width={48} height={10} className="rounded-full" />
            <div className="flex justify-between gap-1">
              <div className="flex flex-col gap-1 ">
                <h3 className="text-lg font-normal">Staff</h3>
                <h3 className="text-lg font-normal">August 1, 2025</h3>
                <h1 className="text-xl">Brak Mondy</h1>
                <div className="flex items-center gap-2">
                    <div className="flex">
                      <Image src={"/profile.png"} alt="profile" width={20} height={10} className="rounded-full" />
                    <Image src={"/profile.png"} alt="profile" width={20} height={10} className="rounded-full" />
                    <Image src={"/profile.png"} alt="profile" width={20} height={10} className="rounded-full" />
                    </div>
                    <span>Seen by 38 people</span>
                </div> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
