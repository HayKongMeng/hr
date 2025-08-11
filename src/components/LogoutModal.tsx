import { CiWarning } from "react-icons/ci"

const LogoutModal = ({ onCancel }: { onCancel?: () => void }) => {
    return (
        <div className="flex flex-col justify-between items-center gap-4 pt-0 p-4 sm:p-6 w-[90vw] max-w-[400px] h-[260px] sm:h-[300px] bg-white rounded-[16px] sm:rounded-[20px] shadow-lg">
            <div className="h-1 w-full bg-red-500" />
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FF1515] rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <CiWarning className="text-white text-3xl sm:text-4xl font-bold" />
            </div>
            <h1 className="text-[#1A1A2E] text-xl sm:text-2xl font-bold">Logout</h1>
            <span className="text-center text-sm sm:text-base">Are you sure you want to log out?</span>

            <div className="flex flex-row justify-between items-center gap-3 sm:gap-4 w-full">
                <button className="box-border flex flex-row justify-center items-center px-4 sm:px-5 py-2.5 sm:py-3.5 gap-2.5
                         h-10 sm:h-12
                bg-[#EAEDF3] border border-[#F5F6F7] rounded-full
                flex-none flex-grow text-sm sm:text-base"
                onClick={onCancel}
                >Cancel</button>
                <button className="box-border flex flex-row justify-center items-center px-4 sm:px-5 py-2.5 sm:py-3.5 gap-2.5
                  h-10 sm:h-12
                bg-[#FF1515] rounded-full
                flex-none flex-grow text-white text-sm sm:text-base"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default LogoutModal