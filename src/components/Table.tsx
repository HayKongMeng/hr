import { IoFileTrayStackedSharp } from "react-icons/io5";
const Table = ({
    columns,
    renderRow,
    data,
}: {
    columns: { header: string; accessor: string; className?: string }[];
    renderRow: (item: any) => React.ReactNode;
    data: any[];
}) => {
    if (!data || data.length === 0) {
        return  <div className="flex flex-col items-center justify-center h-full py-10 text-gray-500">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                <IoFileTrayStackedSharp />
            </div>
            <p className="text-lg font-semibold">No data available</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or add new items.</p>
      </div>
    }

    return (
        <table className="w-full mt-4">
            <thead  className="bg-[#f8f9fd]">
                <tr className="text-left text-black text-sm" >
                    {columns.map((col) => (
                        <th  key={col.accessor} className={`${col.className} py-4 px-4 text-xs border-b uppercase`}>{col.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item) => renderRow(item))}
            </tbody>
        </table>
    );
};

export default Table;
