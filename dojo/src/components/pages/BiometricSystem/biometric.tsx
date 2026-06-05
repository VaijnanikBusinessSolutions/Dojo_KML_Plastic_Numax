import React, { useEffect, useState } from "react";
import { getBioUsers, addBioUser, deleteBioUser, type BioUser, enrollFace,enrollFingerprint } from "./biouserApi";
import { getAttendanceLogs, type AttendanceLog } from "./attendanceApi";
import DashboardCard from "./DashboardCard";
import { MdDeleteForever,MdFace, MdFingerprint } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";


const BioUserDashboard: React.FC = () => {
	const [users, setUsers] = useState<BioUser[]>([]);
	const [logs, setLogs] = useState<AttendanceLog[]>([]);
	const [form, setForm] = useState({
		employeeid: "",
		first_name: "",
		last_name: "",
	});
	const [loading, setLoading] = useState(false);
	const [showFPModal, setShowFPModal] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
	const [fingerIndex, setFingerIndex] = useState(0);

	const fingerOptions = [
		{ value: 0, label: "Left Little" },
		{ value: 1, label: "Left Ring" },
		{ value: 2, label: "Left Middle" },
		{ value: 3, label: "Left Index" },
		{ value: 4, label: "Left Thumb" },
		{ value: 5, label: "Right Thumb" },
		{ value: 6, label: "Right Index" },
		{ value: 7, label: "Right Middle" },
		{ value: 8, label: "Right Ring" },
		{ value: 9, label: "Right Little" },
	];

	// Fetch users and logs
	const fetchUsers = async () => {
		setLoading(true);
		setUsers(await getBioUsers());
		setLoading(false);
	};

	const fetchLogs = async () => {
		setLogs(await getAttendanceLogs());
	};

	useEffect(() => {
		fetchUsers();
		fetchLogs();
	}, []);

	// Calculate dashboard values
	  const registeredEmployees = users.length;
	// const registeredEmployees = logs.map((log) => log.employee_code).length;

	// Active Employees: unique employee_code in logs
	const activeEmployees = Array.from(
		new Set(logs.map((log) => log.employee_code))
	).length;

	// Present Employees: latest log for each employee is "IN"
	// If you have a status field, use it. If not, just count unique employee_code as present.
	// For demo, we'll just use unique employee_code as present

	const empLogCount: { [emp: string]: number } = {};
	logs.forEach((log) => {
		empLogCount[log.employee_code] =
			(empLogCount[log.employee_code] || 0) + 1;
	});
	const presentEmployees = Object.values(empLogCount).filter(
		(count) => count % 2 === 1
	).length;

	// const presentEmployees = activeEmployees;

	// Online/Offline Devices: You need a separate API for this, so keep as demo for now
	const onlineDevices = 1;
	const offlineDevices = 0;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		await addBioUser(form);
		setForm({ employeeid: "", first_name: "", last_name: "" });
		fetchUsers();
	};

	const handleDelete = async (id: number) => {
		await deleteBioUser(id);
		fetchUsers();
	};

	const handleEnrollFace = async (id: number) => {
		try {
			const res = await enrollFace(id, true); // true = overwrite existing face
			// alert(res.result || "Enroll face command sent!");
			alert(
				res.result?.EnrollUserFaceResult
					? `Result: ${res.result.EnrollUserFaceResult}\nCommandId: ${res.result.CommandId}\n\nNow go to the device to complete face enrollment.`
					: JSON.stringify(res.result)
			);
		} catch (err) {
			alert("Failed to enroll face.");
		}
	};

	const openFPModal = (id: number) => {
		setSelectedUserId(id);
		setFingerIndex(0);
		setShowFPModal(true);
	};


	const handleEnrollFingerprint = async () => {
		if (selectedUserId === null) return;
		try {
			const res = await enrollFingerprint(selectedUserId, fingerIndex, true);
			alert(
			res.result?.EnrollUserFPResult
				? `Result: ${res.result.EnrollUserFPResult}\nCommandId: ${res.result.CommandId}`
				: JSON.stringify(res.result)
			);
		} catch (err) {
			alert("Failed to enroll fingerprint.");
		}
		setShowFPModal(false);
	};

	return (
		<div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen'>
			{/* Dashboard Header */}
			<div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg'>
				{/* <h1 className='text-3xl font-bold mb-2'>
					Dashboard{" "}
					<span className='text-gray-400 text-xl font-normal'>
						Biometric Attendance System
					</span>
				</h1> */}
				<div className='flex mt-6 justify-between gap-4'>
					<DashboardCard
						value={registeredEmployees}
						label='Registered Employees'
						color='bg-orange-200'
					/>
					<DashboardCard
						value={activeEmployees}
						label='Active Employees'
						color='bg-blue-200'
					/>
					<DashboardCard
						value={presentEmployees}
						label='Present Employees'
						color='bg-lime-200'
					/>
					<DashboardCard
						value={onlineDevices}
						label='Online Devices'
						color='bg-yellow-300'
					/>
					<DashboardCard
						value={offlineDevices}
						label='Offline Devices'
						color='bg-red-400'
					/>
				</div>
			</div>
			{/* Employee Management */}
			<div className='mx-auto mt-10 bg-white rounded-xl shadow-lg p-8'>
				<h2 className='text-2xl font-semibold mb-6'>
					Employee Management
				</h2>
				<form onSubmit={handleAdd} className='flex gap-4 mb-8'>
					<input
						name='employeeid'
						placeholder='Employee ID'
						value={form.employeeid}
						onChange={handleChange}
						required
						className='flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
					/>
					<input
						name='first_name'
						placeholder='First Name'
						value={form.first_name}
						onChange={handleChange}
						required
						className='flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
					/>
					<input
						name='last_name'
						placeholder='Last Name'
						value={form.last_name}
						onChange={handleChange}
						required
						className='flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
					/>
					<button
						type='submit'
						className='bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition'
					>
						Add Employee
					</button>
				</form>
				{loading ? (
					<p>Loading...</p>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full text-base border-collapse'>
							<thead>
								<tr className='bg-gray-100'>
									<th className='py-3 px-4 border-b-2 border-gray-200'>
										ID
									</th>
									<th className='py-3 px-4 border-b-2 border-gray-200'>
										Employee ID
									</th>
									<th className='py-3 px-4 border-b-2 border-gray-200'>
										Name
									</th>
									<th className='py-3 px-4 border-b-2 border-gray-200'>
										Action
									</th>
								</tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<tr
										key={u.id}
										className='border-b border-gray-100  text-center'
									>
										<td className='py-2 px-4 text-center'>
											{String(u.id)}
										</td>
										<td className='py-2 px-4 text-center'>
											{u.employeeid}
										</td>
										<td className='py-2 px-4 text-center'>
											{u.first_name} {u.last_name}
										</td>
										<td className='py-2 px-4 text-center flex gap-2 justify-center'>
											<button
												onClick={() => handleEnrollFace(u.id)}
												className='text-blue-600 px-4 py-1 rounded hover:text-blue-700 transition'
												title="Enroll Face"
											>
												{/* Enroll Face */}
												<FaUserCircle size={24} />
											</button>

											<button
											  	onClick={() => openFPModal(u.id)}
												// onClick={() => handleEnrollFingerprint(u.id)}
												className='text-green-600 px-4 py-1 rounded hover:text-green-700 transition'
												title="Enroll Fingerprint"
											>
												<MdFingerprint size={24} />
											</button>

											<button
												onClick={() =>
													handleDelete(u.id)
												}
												className='text-red-600 px-4 py-1 rounded hover:text-red-700 transition'
											>
												<MdDeleteForever size={24} />
											</button>
										</td>
									</tr>
								))}
								{users.length === 0 && (
									<tr>
										<td
											colSpan={4}
											className='text-center py-6 text-gray-400'
										>
											No employees found.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{showFPModal && (
				<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px]">
					<h3 className="text-lg font-semibold mb-4">Enroll Fingerprint</h3>
					<label className="block mb-2">Select Finger:</label>
					<select
						className="w-full p-2 border rounded mb-4"
						value={fingerIndex}
						onChange={e => setFingerIndex(Number(e.target.value))}
					>
						{fingerOptions.map(opt => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
						))}
					</select>
					<div className="flex gap-2 justify-end">
						<button
						onClick={() => setShowFPModal(false)}
						className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
						>
						Cancel
						</button>
						<button
						onClick={handleEnrollFingerprint}
						className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
						>
						Enroll
						</button>
					</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BioUserDashboard;
