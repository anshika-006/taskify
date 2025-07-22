export default function () {
    return (
        <div className="mt-2 w-[125px] xl:w-64 p-4 z-50">
            {/* Priority Filters */}
            <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Priority</h2>
                <div className="flex flex-col gap-1">
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="priority" value="Low" className="accent-blue-500" />
                        <span>Low</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="priority" value="Medium" className="accent-blue-500" />
                        <span>Medium</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="priority" value="Urgent" className="accent-blue-500" />
                        <span>Urgent</span>
                    </label>
                </div>
            </div>

            {/* Type Filters */}
            <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Type</h2>
                <div className="flex flex-col gap-1">
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="type" value="Meeting" className="accent-blue-500" />
                        <span>Meeting</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="type" value="Household" className="accent-blue-500" />
                        <span>Household</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="type" value="Work" className="accent-blue-500" />
                        <span>Work</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="type" value="College" className="accent-blue-500" />
                        <span>College</span>
                    </label>
                </div>
            </div>
        </div>

    )
}