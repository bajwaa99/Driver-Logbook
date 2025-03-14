import { React, useRef, useEffect } from 'react';

function LogBook({logData}) {
  const canvasRef = useRef(null);

  // const logData = {
  //   "log_sheets":[{
  //   "id": 5,
  //   "log_sheet_activities": [
  //       {
  //           "id": 23,
  //           "start_time": "00:00:00",
  //           "end_time": "15:15:00",
  //           "status": "OFF_DUTY",
  //           "stop_location": "",
  //           "remarks": "",
  //           "created_at": "2025-03-14T10:29:53.341249Z",
  //           "updated_at": "2025-03-14T10:29:53.341269Z",
  //           "log_sheet": 5
  //       },
  //       {
  //           "id": 24,
  //           "start_time": "15:15:00",
  //           "end_time": "19:45:00",
  //           "status": "DRIVING",
  //           "stop_location": "",
  //           "remarks": "",
  //           "created_at": "2025-03-14T10:29:53.343581Z",
  //           "updated_at": "2025-03-14T10:29:53.343600Z",
  //           "log_sheet": 5
  //       },
  //       {
  //           "id": 25,
  //           "start_time": "19:45:00",
  //           "end_time": "22:00:00",
  //           "status": "ON_DUTY",
  //           "stop_location": "",
  //           "remarks": "",
  //           "created_at": "2025-03-14T10:29:53.345079Z",
  //           "updated_at": "2025-03-14T10:29:53.345098Z",
  //           "log_sheet": 5
  //       },
  //       {
  //           "id": 26,
  //           "start_time": "22:00:00",
  //           "end_time": "00:00:00",
  //           "status": "SLEEPER_BERTH",
  //           "stop_location": "",
  //           "remarks": "",
  //           "created_at": "2025-03-14T10:29:53.346519Z",
  //           "updated_at": "2025-03-14T10:29:53.346537Z",
  //           "log_sheet": 5
  //       }
  //   ],
  //   "date": "2025-03-14",
  //   "carrier_name": "asds",
  //   "truck_number": "232",
  //   "trailer_number": "232",
  //   "main_office_address": "sadsa",
  //   "home_terminal_address": "sadsad",
  //   "total_miles_drove": 23,
  //   "total_mileage": 323,
  //   "dvl_manifest_no": "32",
  //   "shipper_commodity": "sdsa",
  //   "created_at": "2025-03-14T10:29:53.333248Z",
  //   "updated_at": "2025-03-14T10:29:53.333268Z",
  //   "trip": 10
  // }]}

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 960;
    const height = 400;
    let off_duty_hours = 0;
    let sleeper_hours = 0;
    let driving_hours = 0;
    let on_duty_hours = 0;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "black";

    // Draw Grid
    const gridStartX = 50;
    const gridStartY = 100;
    const gridWidth = width;    // 960
    const gridHeight = 200;
    const hourWidth = width / 96; // 10

    // Draw horizontal lines
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(gridStartX, gridStartY + i * (gridHeight / 4));
      ctx.lineTo(gridStartX + gridWidth, gridStartY + i * (gridHeight / 4));
      ctx.stroke();
    }
    ctx.fillText(`1. Off Duty`, 0, gridStartY + 30);
    ctx.fillText(`2. Sleeper`, 0, gridStartY + 1 * (gridHeight / 4) + 30);
    ctx.fillText(`3. Driving`, 0, gridStartY + 2 * (gridHeight / 4) + 30);
    ctx.fillText(`4. On Duty`, 0, gridStartY + 3 * (gridHeight / 4) + 30);

    // Draw vertical lines and hour labels
    let count = 0
    let label = ""
    for (let i = 0; i <= 96; i++) {
      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.moveTo(gridStartX + i * hourWidth, gridStartY);
        ctx.lineTo(gridStartX + i * hourWidth, gridStartY + gridHeight);
        ctx.stroke();

        // Hour labels
        label = count
        if (count === 12) label = "Noon";
        if (count === 0 || i === 96) label = "Mid\night";
        ctx.fillText(label, gridStartX + i * hourWidth, gridStartY - 10);
        if (count === 12) {
          count = 0
        }
        count += 1
      }
    }

    // Draw activity lines and connections
    if (logData && logData.log_sheets?.[0]) {
      let previousActivity = null;
      let prevX, prevY = null;

      ctx.strokeStyle = "blue";
      ctx.lineWidth = 3;

      logData.log_sheets?.[0].log_sheet_activities.forEach((activityData) => {
        let currentActivity = activityData.status;
        const start_time = Number(activityData.start_time.split(":")[0]) * 4 * hourWidth + (Number(activityData.start_time.split(":")[1]) / 15)* hourWidth
        let ending_time = activityData.end_time
        if (ending_time === "00:00:00"){
          ending_time = "24:00:00"
        }
        const end_time = Number(ending_time.split(":")[0]) * 4 * hourWidth + (Number(ending_time.split(":")[1]) / 15)* hourWidth

        console.log("start_time",start_time);
        console.log("end_time",end_time);
        let barY = 0;

        switch (currentActivity) {
          case "OFF_DUTY":
            barY = gridStartY - 25 + (gridHeight / 4);
            off_duty_hours += end_time - start_time;
            break;
          case "SLEEPER_BERTH":
            barY = gridStartY - 25 + (2 * gridHeight) / 4;
            sleeper_hours += end_time - start_time;
            break;
          case "DRIVING":
            barY = gridStartY - 25 + (3 * gridHeight) / 4;
            driving_hours += end_time - start_time;
            break;
          case "ON_DUTY":
            barY = gridStartY - 25 + (4 * gridHeight) / 4;
            on_duty_hours += end_time - start_time;
            break;
          default:
            break;
        }

        ctx.beginPath();
        ctx.moveTo(gridStartX + start_time, barY);
        ctx.lineTo(gridStartX + end_time, barY);
        ctx.stroke();

        // Connect to previous activity
        if (previousActivity !== null) {
          let prevBarY = 0;
          switch (previousActivity) {
            case "OFF_DUTY":
              prevBarY = gridStartY + gridHeight;
              break;
            case "DRIVING":
              prevBarY = gridStartY + (3 * gridHeight) / 4;
              break;
            case "ON_DUTY":
              prevBarY = gridStartY + gridHeight / 2;
              break;
            default:
              break;
          }

          console.log(prevBarY);

          ctx.beginPath();
          ctx.moveTo(gridStartX + prevX, prevY);
          ctx.lineTo(gridStartX + start_time, barY);
          ctx.stroke();
        }

        previousActivity = currentActivity;
        prevX = end_time;
        prevY = barY;
        ctx.fillText(`${activityData?.remarks || ''}`, end_time, gridStartY + gridHeight + 20);
      });
      ctx.lineWidth = 1;

    }


    // Draw Recap section
    ctx.fillText(`Total Hours`, gridStartX + 1000, gridStartY - 10);
    ctx.fillText(`${(off_duty_hours/60).toFixed(1) || 0}`, gridStartX + 1000, gridStartY + 50 - 10);
    ctx.fillText(`${(sleeper_hours/60).toFixed(1) || 0}`, gridStartX + 1000, gridStartY + 100 - 10);
    ctx.fillText(`${(driving_hours/60).toFixed(1) || 0}`, gridStartX + 1000, gridStartY + 150 - 10);
    ctx.fillText(`${(on_duty_hours/60).toFixed(1) || 0}`, gridStartX + 1000, gridStartY + 200 - 10);

    // Draw other text and data
    ctx.fillText(`Drivers Daily Log`, gridStartX, 20);
    ctx.fillText(`From: ${logData?.start_date || ''}`, gridStartX, 40);
    ctx.fillText(`To: ${logData?.end_date || ''}`, gridStartX + 200, 40);
    ctx.fillText(`Name of Carrier: ${logData?.log_sheets?.[0].carrier_name || ''}`, gridStartX + 400, 50);

    ctx.fillText(`Total Miles Driving Today: ${logData?.log_sheets?.[0].total_miles_drove || ''}`, gridStartX, 60);
    ctx.fillText(`Total Milage Today: ${logData?.log_sheets?.[0].total_mileage || ''}`, gridStartX + 200, 60);
    ctx.fillText(`Main Office Address: ${logData?.log_sheets?.[0].main_office_address || ''}`, gridStartX + 400, 60);

    ctx.fillText(`Truck/Tractor No: ${logData?.log_sheets?.[0].truck_number || ''}`, gridStartX, 70);
    ctx.fillText(`Trailer No: ${logData?.log_sheets?.[0].trailer_number || ''}`, gridStartX + 200, 70);
    ctx.fillText(`Home Terminal Address: ${logData?.log_sheets?.[0].home_terminal_address || ''}`, gridStartX + 400, 70);

    ctx.fillText(`Remarks`, gridStartX, gridStartY + gridHeight + 30);
    ctx.fillText(`Shipping Documents: DVL or Manifest No. ${logData?.log_sheets?.[0].dvl_manifest_no || ''}`, gridStartX, gridStartY + gridHeight + 50);
    ctx.fillText(` Shipper & Commodity: ${logData?.log_sheets?.[0].shipper_commodity || ''}`, gridStartX, gridStartY + gridHeight + 80);

  }, [logData]);

  return <><canvas ref={canvasRef} width={1100} height={400} /></>;
}

export default LogBook;
