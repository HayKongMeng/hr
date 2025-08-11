import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { LuArrowLeftToLine, LuArrowRightToLine } from "react-icons/lu";

const Pagination = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
}: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePrevClick = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        onPageChange(page);
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className=" flex items-center justify-between text-gray-500 text-sm gap-2">
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 py-2 px-2 sm:px-4 rounded-md bg-shadow font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
            >
                <LuArrowLeftToLine />
                First
            </button>
            <button
                onClick={handlePrevClick}
                disabled={currentPage === 1}
                className="flex items-center gap-2 py-2 px-2 sm:px-4 rounded-md bg-shadow font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
            >
                <FaArrowLeftLong />
                Back
            </button>


            <div className="mt-5">
                <span>{currentPage} of {totalPages}</span>
            </div>

                <button
                onClick={handleNextClick}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 py-2 px-2 sm:px-4 rounded-md bg-shadow font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next Page"
            >
                <FaArrowRightLong />
                Next
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 py-2 px-2 sm:px-4 rounded-md bg-shadow font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
            >
                <LuArrowRightToLine />
                Last
            </button>
        </div>
    );
};

export default Pagination;
