import React, { useState } from "react";
import * as XLSX from "xlsx";


export default function SimulatorApp() {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [arrivalColumn, setArrivalColumn] = useState("");
  const [serviceColumn, setServiceColumn] = useState("");
  const [results, setResults] = useState([]);
  const [averageTurnAround,setAverageTurnAround]=useState(0);
  const [averageWait,setAverageWait]=useState(0);
  const [averageResponse,setAverageResponse]=useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      setData(sheetData);
      setColumns(Object.keys(sheetData[0]));
    };

    reader.readAsBinaryString(file);
  };

  const timeToInt = (time) => {
    if (typeof time === "number") {
      return time * 1440;
    }
    if (typeof time === "string") {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }
  };

  const intToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSimulation = () => {
    if (!arrivalColumn || !serviceColumn) {
      console.error("Please select both Arrival and Service columns.");
      return;
    }

    const results = [];
    data.forEach((item, index) => {
      const arrival = timeToInt(item[arrivalColumn]) || 0;
      const serviceTime = parseFloat(item[serviceColumn]) || 0;

      let startTime =
        index === 0 ? arrival : Math.max(arrival, results[index - 1].endTime);

      const endTime = startTime + serviceTime;

      // Round startTime and endTime to two decimal places
      startTime = parseInt(startTime);
      console.log("Initial Start Time", startTime);

      const roundedEndTime = parseInt(endTime);
      console.log("Iinitial End Time", roundedEndTime);

      // Calculations using rounded values
      const turnAroundTime = parseFloat((roundedEndTime - arrival).toFixed(2)); // TAT = EndTime - Arrival
      const waitTime = parseFloat((startTime - arrival).toFixed(2)); // WT = StartTime - Arrival
      const responseTime = parseFloat((startTime - arrival).toFixed(2)); // RT = StartTime - Arrival

      results.push({
        startTime,
        endTime: roundedEndTime,
        turnAroundTime,
        waitTime,
        responseTime,
      });
    });

    setResults(results);
    let totalTurnAround = 0;
    let totalWait = 0;
    let totalResponse = 0;

    results.map((e) => {
      totalTurnAround = totalTurnAround + e.turnAroundTime;
      totalWait = totalWait + e.waitTime;
      totalResponse = totalResponse + e.responseTime;
    });
    let averageTurnAround = totalTurnAround / results.length;
    let averageWait = totalWait / results.length;
    let averageResponse = totalResponse / results.length;
    setAverageTurnAround(averageTurnAround);
    setAverageWait(averageWait);
    setAverageResponse(averageResponse);
  //  console.log("Average Turn Around",averageTurnAround);
  //  console.log("Average Wait",averageWait);
  //  console.log("Average Response",averageResponse);
  };

  return (
    <div className="flex w-full flex-col items-start mt-4 min-h-screen px-4 py-3 lg:container lg:mx-auto  xl:max-w-[1695px] xl:custom-margin">
      <h1 className="text-xl font-bold mb-4 text-gray-100">Simulation App</h1>

      <input
        type="file"
        accept=".xlsx, .csv"
        onChange={handleFileUpload}
        className="mb-4 block text-gray-100"
      />

      {columns.length > 0 && (
        <div className="space-y-4 text-[#fff]">
          <div>
            <label className="block font-medium mb-2">
              Select Arrival Time Column
            </label>
            <select
              value={arrivalColumn}
              onChange={(e) => setArrivalColumn(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="">-- Select --</option>
              {columns.map((col) => (
                <option key={col} value={col} className="text-[#000]">
                  {col}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2">
              Select Service Time Column
            </label>
            <select
              value={serviceColumn}
              onChange={(e) => setServiceColumn(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="">-- Select --</option>
              {columns.map((col) => (
                <option key={col} value={col} className="text-[#000]">
                  {col}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        onClick={handleSimulation}
        className="bg-blue-500 text-[#000] px-4 py-2 mt-4 rounded"
      >
        Start Simulation
      </button>

      <div className="flex justify-center gap-4">

        <div>
      {results.length > 0 && (
        <table className="table-auto w-full mt-6 border text-[#fff]">
          <thead>
            <tr>
              <th className="border px-4 py-2">Start Time</th>
              <th className="border px-4 py-2">End Time</th>
              <th className="border px-4 py-2">Turnaround Time</th>
              <th className="border px-4 py-2">Wait Time</th>
              <th className="border px-4 py-2">Response Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  {intToTime(parseFloat(result.startTime.toFixed(2)))}
                </td>
                <td className="border px-4 py-2">
                  {intToTime(parseFloat(result.endTime.toFixed(2)))}
                </td>
                <td className="border px-4 py-2">
                  {result.turnAroundTime.toFixed(2)}
                </td>
                <td className="border px-4 py-2">
                  {result.waitTime.toFixed(2)}
                </td>
                <td className="border px-4 py-2">
                  {result.responseTime.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
 
      <div>
    {results.length>0 && (
        <div className="mt-6 p-4 border rounded text-[#fff]">
          <p><strong>Average TurnAround Time: </strong>{averageTurnAround.toFixed(2)}</p>
          <p><strong>Average Wait Time: </strong>{averageWait.toFixed(2)}</p>
          <p><strong>Average Response Time:</strong>{averageResponse.toFixed(2)}</p>
        </div>
     )
     }
     </div>
     </div>
    

    </div>
  );
}