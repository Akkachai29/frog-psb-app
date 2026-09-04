let currentResult = null;


// ======================================================
// VERSION 3.2.1
// HISTORY PAGINATION
// ======================================================

const HISTORY_PAGE_SIZE = 10;

let historyVisibleCount =
  HISTORY_PAGE_SIZE;


// ======================================================
// START APP
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    setToday();

    loadPondProfiles();

    loadHistory();

    loadChartPondOptions();

    renderCharts();

  }
);



// ======================================================
// TODAY
// ======================================================

function setToday() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");


  const today =
    `${year}-${month}-${day}`;


  document.getElementById(
    "recordDate"
  ).value = today;

}



// ======================================================
// CALCULATE
// ======================================================

function calculate() {

  const feed =
    parseFloat(
      document.getElementById(
        "feed"
      ).value
    );


  const protein =
    parseFloat(
      document.getElementById(
        "protein"
      ).value
    );


  const width =
    parseFloat(
      document.getElementById(
        "width"
      ).value
    );


  const length =
    parseFloat(
      document.getElementById(
        "length"
      ).value
    );


  const depth =
    parseFloat(
      document.getElementById(
        "depth"
      ).value
    );



  if (
    isNaN(feed) ||
    isNaN(protein) ||
    isNaN(width) ||
    isNaN(length) ||
    isNaN(depth)
  ) {

    alert(
      "กรุณากรอกข้อมูลให้ครบ"
    );

    return;

  }


  if (
    feed <= 0 ||
    protein <= 0 ||
    protein > 100 ||
    width <= 0 ||
    length <= 0 ||
    depth <= 0
  ) {

    alert(
      "กรุณาตรวจสอบค่าที่กรอก"
    );

    return;

  }



  const Rn =
    0.31;


  const nitrogenFraction =
    0.16;



  const proteinDecimal =
    protein / 100;


  const nWaste =
    feed *
    proteinDecimal *
    nitrogenFraction *
    (1 - Rn);



  const waterVolume =
    width *
    length *
    depth;


  const waterLiter =
    waterVolume * 1000;



  const psb =
    nWaste *
    waterVolume;



  let level = "";

  let levelClass = "";


  if (
    nWaste < 0.1
  ) {

    level =
      "ต่ำ";

    levelClass =
      "status-low";

  }

  else if (
    nWaste < 0.5
  ) {

    level =
      "ปานกลาง";

    levelClass =
      "status-medium";

  }

  else if (
    nWaste <= 1.0
  ) {

    level =
      "สูง";

    levelClass =
      "status-high";

  }

  else {

    level =
      "วิกฤต";

    levelClass =
      "status-critical";

  }



  document.getElementById(
    "nwaste"
  ).innerText =
    nWaste.toFixed(4);


  document.getElementById(
    "nwasteGram"
  ).innerText =
    (nWaste * 1000).toFixed(1);


  document.getElementById(
    "volume"
  ).innerText =
    waterVolume.toFixed(2);


  document.getElementById(
    "volumeLiter"
  ).innerText =
    waterLiter.toFixed(0);


  document.getElementById(
    "psb"
  ).innerText =
    psb.toFixed(2);



  const levelBadge =
    document.getElementById(
      "levelBadge"
    );


  levelBadge.innerText =
    level;


  levelBadge.className =
    "status-badge status-large " +
    levelClass;



  currentResult = {

    feed:
      feed,

    protein:
      protein,

    width:
      width,

    length:
      length,

    depth:
      depth,

    nWaste:
      nWaste,

    waterVolume:
      waterVolume,

    waterLiter:
      waterLiter,

    psb:
      psb,

    level:
      level

  };

}



// ======================================================
// POND PROFILES
// ======================================================

function getPondProfiles() {

  const stored =
    localStorage.getItem(
      "frogFarmPonds"
    );


  if (!stored) {

    return [];

  }


  try {

    return JSON.parse(
      stored
    );

  }

  catch (error) {

    return [];

  }

}



// ======================================================
// SAVE POND
// ======================================================

function savePondProfile() {

  const pondName =
    document.getElementById(
      "pondName"
    ).value.trim();


  const width =
    parseFloat(
      document.getElementById(
        "width"
      ).value
    );


  const length =
    parseFloat(
      document.getElementById(
        "length"
      ).value
    );


  const depth =
    parseFloat(
      document.getElementById(
        "depth"
      ).value
    );


  if (
    !pondName
  ) {

    alert(
      "กรุณากรอกชื่อบ่อ"
    );

    return;

  }


  if (
    isNaN(width) ||
    isNaN(length) ||
    isNaN(depth) ||
    width <= 0 ||
    length <= 0 ||
    depth <= 0
  ) {

    alert(
      "กรุณากรอกขนาดบ่อให้ครบก่อนบันทึก"
    );

    return;

  }



  const profiles =
    getPondProfiles();



  const existingIndex =
    profiles.findIndex(
      function (pond) {

        return (
          pond.name.toLowerCase() ===
          pondName.toLowerCase()
        );

      }
    );



  const newProfile = {

    id:
      existingIndex >= 0
        ? profiles[
            existingIndex
          ].id
        : Date.now(),

    name:
      pondName,

    width:
      width,

    length:
      length,

    depth:
      depth

  };



  if (
    existingIndex >= 0
  ) {

    profiles[
      existingIndex
    ] =
      newProfile;

  }

  else {

    profiles.push(
      newProfile
    );

  }



  localStorage.setItem(

    "frogFarmPonds",

    JSON.stringify(
      profiles
    )

  );



  loadPondProfiles(
    newProfile.id
  );


  alert(
    "บันทึกข้อมูลบ่อเรียบร้อย"
  );

}



// ======================================================
// LOAD POND LIST
// ======================================================

function loadPondProfiles(
  selectedId = null
) {

  const profiles =
    getPondProfiles();


  const select =
    document.getElementById(
      "pondSelect"
    );


  select.innerHTML =
    `
    <option value="">
      -- บ่อใหม่ / ยังไม่ได้เลือก --
    </option>
    `;



  profiles.forEach(
    function (pond) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        pond.id;


      option.textContent =
        `${pond.name} (${pond.width} × ${pond.length} × ${pond.depth} m)`;


      select.appendChild(
        option
      );

    }
  );



  if (
    selectedId !== null
  ) {

    select.value =
      String(
        selectedId
      );

  }

}



// ======================================================
// LOAD SELECTED POND
// ======================================================

function loadSelectedPond() {

  const selectedId =
    document.getElementById(
      "pondSelect"
    ).value;


  if (
    !selectedId
  ) {

    document.getElementById(
      "pondName"
    ).value = "";

    return;

  }



  const profiles =
    getPondProfiles();



  const pond =
    profiles.find(
      function (item) {

        return (
          String(item.id) ===
          String(selectedId)
        );

      }
    );


  if (
    !pond
  ) {

    return;

  }



  document.getElementById(
    "pondName"
  ).value =
    pond.name;


  document.getElementById(
    "width"
  ).value =
    pond.width;


  document.getElementById(
    "length"
  ).value =
    pond.length;


  document.getElementById(
    "depth"
  ).value =
    pond.depth;

}



// ======================================================
// DELETE POND
// ======================================================

function deleteSelectedPond() {

  const selectedId =
    document.getElementById(
      "pondSelect"
    ).value;


  if (
    !selectedId
  ) {

    alert(
      "กรุณาเลือกบ่อที่ต้องการลบ"
    );

    return;

  }



  const profiles =
    getPondProfiles();



  const pond =
    profiles.find(
      function (item) {

        return (
          String(item.id) ===
          String(selectedId)
        );

      }
    );


  if (
    !pond
  ) {

    return;

  }



  const confirmed =
    confirm(
      `ต้องการลบ "${pond.name}" หรือไม่?`
    );


  if (
    !confirmed
  ) {

    return;

  }



  const newProfiles =
    profiles.filter(
      function (item) {

        return (
          String(item.id) !==
          String(selectedId)
        );

      }
    );



  localStorage.setItem(

    "frogFarmPonds",

    JSON.stringify(
      newProfiles
    )

  );



  document.getElementById(
    "pondName"
  ).value = "";


  document.getElementById(
    "width"
  ).value = "";


  document.getElementById(
    "length"
  ).value = "";


  document.getElementById(
    "depth"
  ).value = "";



  loadPondProfiles();


  alert(
    "ลบข้อมูลบ่อเรียบร้อย"
  );

}



// ======================================================
// SAVE RECORD
// ======================================================

function saveRecord() {

  if (
    !currentResult
  ) {

    alert(
      "กรุณากดคำนวณก่อนบันทึกข้อมูล"
    );

    return;

  }



  const date =
    document.getElementById(
      "recordDate"
    ).value;


  let pond =
    document.getElementById(
      "pondName"
    ).value.trim();



  if (
    !date
  ) {

    alert(
      "กรุณาเลือกวันที่"
    );

    return;

  }


  if (
    !pond
  ) {

    pond =
      "ไม่ระบุชื่อบ่อ";

  }



  const record = {

    id:
      Date.now(),

    date:
      date,

    pond:
      pond,

    feed:
      currentResult.feed,

    protein:
      currentResult.protein,

    width:
      currentResult.width,

    length:
      currentResult.length,

    depth:
      currentResult.depth,

    nWaste:
      currentResult.nWaste,

    waterVolume:
      currentResult.waterVolume,

    psb:
      currentResult.psb,

    level:
      currentResult.level

  };



  const records =
    getRecords();


  records.unshift(
    record
  );



  localStorage.setItem(

    "frogFarmRecords",

    JSON.stringify(
      records
    )

  );



  historyVisibleCount =
    HISTORY_PAGE_SIZE;


  alert(
    "บันทึกข้อมูลเรียบร้อย"
  );


  loadHistory();

  loadChartPondOptions(
    pond
  );

  renderCharts();

}



// ======================================================
// GET RECORDS
// ======================================================

function getRecords() {

  const stored =
    localStorage.getItem(
      "frogFarmRecords"
    );


  if (
    !stored
  ) {

    return [];

  }


  try {

    return JSON.parse(
      stored
    );

  }

  catch (error) {

    return [];

  }

}



// ======================================================
// HISTORY
// ======================================================

function loadHistory() {

  const records =
    getRecords();


  const historyList =
    document.getElementById(
      "historyList"
    );


  const moreWrapper =
    document.getElementById(
      "historyMoreWrapper"
    );


  const moreButton =
    document.getElementById(
      "historyMoreButton"
    );


  historyList.innerHTML =
    "";



  if (
    records.length === 0
  ) {

    historyList.innerHTML =
      `
      <div class="empty-history">
        ยังไม่มีข้อมูลที่บันทึก
      </div>
      `;


    if (
      moreWrapper
    ) {

      moreWrapper.style.display =
        "none";

    }


    return;

  }



  const visibleRecords =
    records.slice(
      0,
      historyVisibleCount
    );



  visibleRecords.forEach(
    function (record) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "history-item";


      const levelClass =
        getHistoryLevelClass(
          record.level
        );


      item.innerHTML =
        `

        <div class="history-top">

          <div class="history-pond">

            ${escapeHTML(
              record.pond
            )}

          </div>


          <div class="history-top-right">

            <div class="history-date">

              ${formatDate(
                record.date
              )}

            </div>


            <button
              class="btn-delete-record"
              onclick="deleteRecord(${record.id})"
              title="ลบรายการ"
            >
              ×
            </button>

          </div>

        </div>


        <div class="history-data">

          <div>

            <span>
              อาหาร
            </span>

            <strong>
              ${record.feed} kg
            </strong>

          </div>


          <div>

            <span>
              โปรตีน
            </span>

            <strong>
              ${record.protein} %
            </strong>

          </div>


          <div>

            <span>
              N_waste
            </span>

            <strong>
              ${record.nWaste.toFixed(4)}
            </strong>

          </div>


          <div>

            <span>
              น้ำในบ่อ
            </span>

            <strong>
              ${record.waterVolume.toFixed(2)} m³
            </strong>

          </div>


          <div>

            <span>
              PSB
            </span>

            <strong>
              ${record.psb.toFixed(2)} ml
            </strong>

          </div>

        </div>


        <div
          class="
            history-level
            ${levelClass}
          "
        >

          ระดับของเสีย:
          ${record.level}

        </div>

        `;


      historyList.appendChild(
        item
      );

    }
  );



  if (
    moreWrapper &&
    moreButton
  ) {

    if (
      historyVisibleCount >=
      records.length
    ) {

      moreWrapper.style.display =
        "none";

    }

    else {

      moreWrapper.style.display =
        "block";


      const remaining =
        records.length -
        historyVisibleCount;


      moreButton.textContent =
        remaining >
        HISTORY_PAGE_SIZE
          ? `ดูเพิ่มเติมอีก ${HISTORY_PAGE_SIZE} รายการ`
          : `ดูเพิ่มเติมอีก ${remaining} รายการ`;

    }

  }

}



// ======================================================
// SHOW MORE HISTORY
// ======================================================

function showMoreHistory() {

  historyVisibleCount +=
    HISTORY_PAGE_SIZE;


  loadHistory();

}



// ======================================================
// HISTORY LEVEL COLOR
// ======================================================

function getHistoryLevelClass(
  level
) {

  if (
    level === "ต่ำ"
  ) {

    return (
      "history-level-low"
    );

  }


  if (
    level === "ปานกลาง"
  ) {

    return (
      "history-level-medium"
    );

  }


  if (
    level === "สูง"
  ) {

    return (
      "history-level-high"
    );

  }


  if (
    level === "วิกฤต"
  ) {

    return (
      "history-level-critical"
    );

  }


  return "";

}



// ======================================================
// DELETE RECORD
// ======================================================

function deleteRecord(
  id
) {

  const records =
    getRecords();


  const record =
    records.find(
      function (item) {

        return (
          item.id === id
        );

      }
    );


  if (
    !record
  ) {

    return;

  }



  const confirmed =
    confirm(
      `ต้องการลบข้อมูล ${record.pond} วันที่ ${formatDate(record.date)} หรือไม่?`
    );


  if (
    !confirmed
  ) {

    return;

  }



  const newRecords =
    records.filter(
      function (item) {

        return (
          item.id !== id
        );

      }
    );



  localStorage.setItem(

    "frogFarmRecords",

    JSON.stringify(
      newRecords
    )

  );



  if (
    historyVisibleCount >
    HISTORY_PAGE_SIZE &&
    historyVisibleCount >
    newRecords.length
  ) {

    historyVisibleCount =
      Math.max(
        HISTORY_PAGE_SIZE,
        newRecords.length
      );

  }


  loadHistory();

  loadChartPondOptions();

  renderCharts();

}



// ======================================================
// CLEAR ALL HISTORY
// ======================================================

function clearHistory() {

  const confirmed =
    confirm(
      "ต้องการลบประวัติทั้งหมดหรือไม่?"
    );


  if (
    !confirmed
  ) {

    return;

  }


  localStorage.removeItem(
    "frogFarmRecords"
  );


  historyVisibleCount =
    HISTORY_PAGE_SIZE;


  loadHistory();

  loadChartPondOptions();

  renderCharts();

}



// ======================================================
// CHART POND OPTIONS
// ======================================================

function loadChartPondOptions(
  preferredPond = null
) {

  const select =
    document.getElementById(
      "chartPondSelect"
    );


  if (
    !select
  ) {

    return;

  }


  const oldValue =
    select.value;


  const records =
    getRecords();


  const ponds = [];


  records.forEach(
    function (record) {

      if (
        !ponds.includes(
          record.pond
        )
      ) {

        ponds.push(
          record.pond
        );

      }

    }
  );



  select.innerHTML =
    "";


  if (
    ponds.length === 0
  ) {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      "";


    option.textContent =
      "-- ยังไม่มีข้อมูล --";


    select.appendChild(
      option
    );


    return;

  }



  ponds.forEach(
    function (pond) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        pond;


      option.textContent =
        pond;


      select.appendChild(
        option
      );

    }
  );



  if (
    preferredPond &&
    ponds.includes(
      preferredPond
    )
  ) {

    select.value =
      preferredPond;

  }

  else if (
    oldValue &&
    ponds.includes(
      oldValue
    )
  ) {

    select.value =
      oldValue;

  }

  else {

    select.value =
      ponds[0];

  }

}



// ======================================================
// RENDER CHARTS
// ======================================================

function renderCharts() {

  const select =
    document.getElementById(
      "chartPondSelect"
    );


  if (
    !select
  ) {

    return;

  }


  const selectedPond =
    select.value;


  const records =
    getRecords();



  const pondRecords =
    records.filter(
      function (record) {

        return (
          record.pond ===
          selectedPond
        );

      }
    );



  pondRecords.sort(
    function (a, b) {

      const dateA =
        new Date(
          a.date +
          "T00:00:00"
        );


      const dateB =
        new Date(
          b.date +
          "T00:00:00"
        );


      if (
        dateA.getTime() ===
        dateB.getTime()
      ) {

        return (
          a.id - b.id
        );

      }


      return (
        dateA - dateB
      );

    }
  );



  createLineChart(

    "nWasteChart",

    pondRecords,

    function (record) {

      return record.nWaste;

    },

    4

  );



  createLineChart(

    "psbChart",

    pondRecords,

    function (record) {

      return record.psb;

    },

    2

  );

}



// ======================================================
// CREATE SVG LINE CHART
// ======================================================

function createLineChart(
  containerId,
  records,
  valueGetter,
  decimalPlaces
) {

  const container =
    document.getElementById(
      containerId
    );


  if (
    !container
  ) {

    return;

  }



  container.innerHTML =
    "";



  if (
    records.length === 0
  ) {

    container.innerHTML =
      `
      <div class="chart-empty">
        ยังไม่มีข้อมูลสำหรับแสดงกราฟ
      </div>
      `;

    return;

  }



  const width =
    600;


  const height =
    260;


  const margin = {

    top:
      22,

    right:
      24,

    bottom:
      58,

    left:
      65

  };


  const chartWidth =
    width -
    margin.left -
    margin.right;


  const chartHeight =
    height -
    margin.top -
    margin.bottom;



  const values =
    records.map(
      function (record) {

        return Number(
          valueGetter(
            record
          )
        );

      }
    );



  let maxValue =
    Math.max.apply(
      null,
      values
    );


  if (
    maxValue <= 0
  ) {

    maxValue =
      1;

  }


  maxValue =
    maxValue *
    1.15;



  const svg =
    createSVGElement(
      "svg"
    );


  svg.setAttribute(
    "viewBox",
    `0 0 ${width} ${height}`
  );


  svg.setAttribute(
    "role",
    "img"
  );



  const background =
    createSVGElement(
      "rect"
    );


  background.setAttribute(
    "x",
    0
  );

  background.setAttribute(
    "y",
    0
  );

  background.setAttribute(
    "width",
    width
  );

  background.setAttribute(
    "height",
    height
  );

  background.setAttribute(
    "fill",
    "#ffffff"
  );


  svg.appendChild(
    background
  );



  const gridCount =
    4;


  for (
    let i = 0;
    i <= gridCount;
    i++
  ) {

    const ratio =
      i /
      gridCount;


    const y =
      margin.top +
      chartHeight -
      ratio *
      chartHeight;


    const line =
      createSVGElement(
        "line"
      );


    line.setAttribute(
      "x1",
      margin.left
    );

    line.setAttribute(
      "x2",
      margin.left +
      chartWidth
    );

    line.setAttribute(
      "y1",
      y
    );

    line.setAttribute(
      "y2",
      y
    );

    line.setAttribute(
      "stroke",
      "#e3ebe7"
    );

    line.setAttribute(
      "stroke-width",
      "1"
    );


    svg.appendChild(
      line
    );



    const value =
      maxValue *
      ratio;


    const label =
      createSVGElement(
        "text"
      );


    label.setAttribute(
      "x",
      margin.left - 10
    );

    label.setAttribute(
      "y",
      y + 4
    );

    label.setAttribute(
      "text-anchor",
      "end"
    );

    label.setAttribute(
      "font-size",
      "11"
    );

    label.setAttribute(
      "fill",
      "#71817a"
    );


    label.textContent =
      value.toFixed(
        decimalPlaces
      );


    svg.appendChild(
      label
    );

  }



  const xAxis =
    createSVGElement(
      "line"
    );


  xAxis.setAttribute(
    "x1",
    margin.left
  );

  xAxis.setAttribute(
    "x2",
    margin.left +
    chartWidth
  );

  xAxis.setAttribute(
    "y1",
    margin.top +
    chartHeight
  );

  xAxis.setAttribute(
    "y2",
    margin.top +
    chartHeight
  );

  xAxis.setAttribute(
    "stroke",
    "#b9c8c1"
  );


  svg.appendChild(
    xAxis
  );



  const yAxis =
    createSVGElement(
      "line"
    );


  yAxis.setAttribute(
    "x1",
    margin.left
  );

  yAxis.setAttribute(
    "x2",
    margin.left
  );

  yAxis.setAttribute(
    "y1",
    margin.top
  );

  yAxis.setAttribute(
    "y2",
    margin.top +
    chartHeight
  );

  yAxis.setAttribute(
    "stroke",
    "#b9c8c1"
  );


  svg.appendChild(
    yAxis
  );



  const points =
    [];


  records.forEach(
    function (
      record,
      index
    ) {

      let x;


      if (
        records.length === 1
      ) {

        x =
          margin.left +
          chartWidth / 2;

      }

      else {

        x =
          margin.left +
          (
            index /
            (
              records.length - 1
            )
          ) *
          chartWidth;

      }



      const value =
        Number(
          valueGetter(
            record
          )
        );


      const y =
        margin.top +
        chartHeight -
        (
          value /
          maxValue
        ) *
        chartHeight;



      points.push({

        x:
          x,

        y:
          y,

        value:
          value

      });



      const dateLabel =
        createSVGElement(
          "text"
        );


      dateLabel.setAttribute(
        "x",
        x
      );

      dateLabel.setAttribute(
        "y",
        margin.top +
        chartHeight +
        24
      );

      dateLabel.setAttribute(
        "text-anchor",
        "middle"
      );

      dateLabel.setAttribute(
        "font-size",
        "10"
      );

      dateLabel.setAttribute(
        "fill",
        "#74847d"
      );


      dateLabel.textContent =
        formatShortDate(
          record.date
        );


      svg.appendChild(
        dateLabel
      );

    }
  );



  if (
    points.length > 1
  ) {

    const polyline =
      createSVGElement(
        "polyline"
      );


    const pointText =
      points
        .map(
          function (point) {

            return (
              `${point.x},${point.y}`
            );

          }
        )
        .join(" ");


    polyline.setAttribute(
      "points",
      pointText
    );


    polyline.setAttribute(
      "fill",
      "none"
    );

    polyline.setAttribute(
      "stroke",
      "#18543f"
    );

    polyline.setAttribute(
      "stroke-width",
      "3"
    );

    polyline.setAttribute(
      "stroke-linecap",
      "round"
    );

    polyline.setAttribute(
      "stroke-linejoin",
      "round"
    );


    svg.appendChild(
      polyline
    );

  }



  points.forEach(
    function (point) {

      const circle =
        createSVGElement(
          "circle"
        );


      circle.setAttribute(
        "cx",
        point.x
      );

      circle.setAttribute(
        "cy",
        point.y
      );

      circle.setAttribute(
        "r",
        "5"
      );

      circle.setAttribute(
        "fill",
        "#e58d00"
      );

      circle.setAttribute(
        "stroke",
        "#ffffff"
      );

      circle.setAttribute(
        "stroke-width",
        "2"
      );


      svg.appendChild(
        circle
      );



      const valueText =
        createSVGElement(
          "text"
        );


      valueText.setAttribute(
        "x",
        point.x
      );

      valueText.setAttribute(
        "y",
        point.y - 11
      );

      valueText.setAttribute(
        "text-anchor",
        "middle"
      );

      valueText.setAttribute(
        "font-size",
        "10"
      );

      valueText.setAttribute(
        "font-weight",
        "bold"
      );

      valueText.setAttribute(
        "fill",
        "#173f32"
      );


      valueText.textContent =
        point.value.toFixed(
          decimalPlaces
        );


      svg.appendChild(
        valueText
      );

    }
  );



  container.appendChild(
    svg
  );

}



// ======================================================
// SVG HELPER
// ======================================================

function createSVGElement(
  tag
) {

  return document.createElementNS(
    "http://www.w3.org/2000/svg",
    tag
  );

}



// ======================================================
// SHORT DATE
// ======================================================

function formatShortDate(
  dateString
) {

  const date =
    new Date(
      dateString +
      "T00:00:00"
    );


  return date.toLocaleDateString(

    "th-TH",

    {

      day:
        "numeric",

      month:
        "short"

    }

  );

}



// ======================================================
// FULL DATE
// ======================================================

function formatDate(
  dateString
) {

  const date =
    new Date(
      dateString +
      "T00:00:00"
    );


  return date.toLocaleDateString(

    "th-TH",

    {

      day:
        "numeric",

      month:
        "short",

      year:
        "numeric"

    }

  );

}



// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}



// ======================================================
// RESET FORM
// ======================================================

function resetForm() {

  document.getElementById(
    "feed"
  ).value = "";


  document.getElementById(
    "protein"
  ).value = "";


  document.getElementById(
    "nwaste"
  ).innerText = "-";


  document.getElementById(
    "nwasteGram"
  ).innerText = "-";


  document.getElementById(
    "volume"
  ).innerText = "-";


  document.getElementById(
    "volumeLiter"
  ).innerText = "-";


  document.getElementById(
    "psb"
  ).innerText = "-";


  const levelBadge =
    document.getElementById(
      "levelBadge"
    );


  levelBadge.innerText =
    "-";


  levelBadge.className =
    "status-badge status-large";


  currentResult =
    null;

}