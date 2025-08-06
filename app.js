// 13 项美德（富兰克林原始顺序）
const virtues = [
  { 
    name: "1. 节制", 
    desc: "食不过饱，饮不过量",
    tips: [
      "控制饮食量，吃到七分饱就停止",
      "避免过量饮酒，保持清醒",
      "培养对欲望的自我控制能力",
      "在购物前思考是否真的需要"
    ]
  },
  { 
    name: "2. 沉默", 
    desc: "言必有益，避免闲谈",
    tips: [
      "说话前先思考是否有必要",
      "避免八卦和负面言论",
      "多听少说，学会倾听",
      "用沉默来避免不必要的冲突"
    ]
  },
  { 
    name: "3. 秩序", 
    desc: "物归其位，事按时做",
    tips: [
      "保持工作环境整洁有序",
      "制定每日计划并严格执行",
      "为每样物品安排固定位置",
      "按时完成承诺的任务"
    ]
  },
  { 
    name: "4. 决心", 
    desc: "下定决心做该做之事",
    tips: [
      "设定明确的目标并坚持执行",
      "克服拖延，立即行动",
      "培养意志力，不轻易放弃",
      "将大目标分解为小步骤"
    ]
  },
  { 
    name: "5. 节俭", 
    desc: "花钱须于己于人有利",
    tips: [
      "制定预算并严格执行",
      "避免冲动消费",
      "投资于自我提升",
      "为未来储蓄和规划"
    ]
  },
  { 
    name: "6. 勤勉", 
    desc: "珍惜时间，用于有益之事",
    tips: [
      "合理规划时间，提高效率",
      "避免浪费时间在无意义的事情上",
      "持续学习新知识和技能",
      "保持专注，一次只做一件事"
    ]
  },
  { 
    name: "7. 诚实", 
    desc: "不欺骗，思想纯洁公正",
    tips: [
      "始终说真话，即使困难",
      "承认错误并承担责任",
      "保持内心的诚实和正直",
      "避免任何形式的欺骗"
    ]
  },
  { 
    name: "8. 正义", 
    desc: "不损人利己，尽责助人",
    tips: [
      "公平对待每个人",
      "帮助需要帮助的人",
      "不占他人便宜",
      "为正义发声"
    ]
  },
  { 
    name: "9. 中庸", 
    desc: "避免极端，忍让化解怨恨",
    tips: [
      "保持平衡，避免走极端",
      "学会妥协和忍让",
      "控制情绪，理性处理冲突",
      "寻求中间道路"
    ]
  },
  { 
    name: "10. 清洁", 
    desc: "身体、衣着、居所洁净",
    tips: [
      "保持个人卫生",
      "整理居住和工作环境",
      "穿着得体整洁",
      "培养良好的生活习惯"
    ]
  },
  { 
    name: "11. 平静", 
    desc: "不为琐事扰乱心神",
    tips: [
      "学会放松和冥想",
      "不被小事困扰",
      "保持内心的平静",
      "培养抗压能力"
    ]
  },
  { 
    name: "12. 贞洁", 
    desc: "节欲保健康，不损名誉",
    tips: [
      "保持身心的纯洁",
      "避免不当行为",
      "尊重自己和他人",
      "培养高尚的品德"
    ]
  },
  { 
    name: "13. 谦逊", 
    desc: "效法耶稣与苏格拉底",
    tips: [
      "承认自己的不足",
      "虚心学习他人优点",
      "不炫耀成就",
      "保持开放和谦虚的态度"
    ]
  }
];

// 全局变量
let currentFocus = 0; // 当前专注的美德索引
let currentWeek = getCurrentWeek();
let displayWeek = currentWeek; // 当前显示的周数
let streakData = { current: 0, best: 0, lastDate: null };

// 获取当前周数
function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
}

// 获取本周的日期范围
function getWeekDateRange() {
  const now = new Date();
  const currentDay = now.getDay(); // 0是周日，1是周一
  const mondayOffset = currentDay === 0 ? 6 : currentDay - 1; // 调整为周一开始
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    monday: monday,
    sunday: sunday
  };
}

// 格式化日期
function formatDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 更新周数显示
function updateWeekDisplay() {
  const weekRange = getWeekDateRange();
  document.getElementById("currentWeekDisplay").textContent = currentWeek;
  document.getElementById("dateRangeDisplay").textContent = 
    `${formatDate(weekRange.monday)} - ${formatDate(weekRange.sunday)}`;
}

// 获取当前是周几（0-6，0是周日）
function getCurrentDay() {
  return new Date().getDay();
}

// 初始化表格
function initTable() {
  const tbody = document.querySelector("#virtueTable tbody");
  tbody.innerHTML = "";

  virtues.forEach((virtue, rowIndex) => {
    const row = document.createElement("tr");

    // 美德名称单元格（可点击查看详情）
    const virtueCell = document.createElement("td");
    virtueCell.className = "virtue-name clickable";
    virtueCell.textContent = virtue.name;
    virtueCell.title = "点击查看详情";
    virtueCell.addEventListener("click", () => showVirtueDetail(rowIndex));
    row.appendChild(virtueCell);

    // 生成7个格子（周一到周日）
    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("td");
      cell.textContent = "○";
      cell.className = "clickable";
      cell.addEventListener("click", () => toggleCheck(cell, rowIndex, day));
      row.appendChild(cell);
    }

    tbody.appendChild(row);
  });
}

// 切换打卡状态
function toggleCheck(cell, rowIndex, day) {
  const isChecked = cell.textContent === "✓";
  cell.textContent = isChecked ? "○" : "✓";
  cell.classList.toggle("checked", !isChecked);

  // 存储数据
  const data = JSON.parse(localStorage.getItem("virtueData") || "{}");
  const key = `${displayWeek}-${rowIndex}-${day}`;
  data[key] = !isChecked;
  localStorage.setItem("virtueData", JSON.stringify(data));

  // 更新统计
  updateStats();
  updateFocusProgress();
  updateStreak();
}

// 更新统计数据
function updateStats() {
  const data = JSON.parse(localStorage.getItem("virtueData") || "{}");
  let totalChecked = 0;
  let totalPossible = 0;

  // 计算当前显示周的数据
  virtues.forEach((virtue, rowIndex) => {
    for (let day = 0; day < 7; day++) {
      const key = `${displayWeek}-${rowIndex}-${day}`;
      if (data[key]) {
        totalChecked++;
      }
      totalPossible++;
    }
  });

  const completionRate = totalPossible > 0 ? Math.round((totalChecked / totalPossible) * 100) : 0;

  document.getElementById("totalChecked").textContent = totalChecked;
  document.getElementById("completionRate").textContent = completionRate + "%";
  document.getElementById("currentStreak").textContent = streakData.current;
  document.getElementById("bestStreak").textContent = streakData.best;
  document.getElementById("currentStreakDisplay").textContent = streakData.current;
}

// 更新专注进度
function updateFocusProgress() {
  if (currentFocus >= 0 && currentFocus < virtues.length) {
    const data = JSON.parse(localStorage.getItem("virtueData") || "{}");
    let checkedDays = 0;

    for (let day = 0; day < 7; day++) {
      const key = `${displayWeek}-${currentFocus}-${day}`;
      if (data[key]) {
        checkedDays++;
      }
    }

    const progressPercent = (checkedDays / 7) * 100;
    document.getElementById("focusProgress").style.width = progressPercent + "%";
    document.getElementById("focusProgressText").textContent = `${checkedDays}/7`;

    // 更新专注美德显示
    document.getElementById("focusVirtue").textContent = virtues[currentFocus].name;
    document.getElementById("focusDesc").textContent = virtues[currentFocus].desc;
  }
}

// 更新连续打卡
function updateStreak() {
  const today = new Date().toDateString();
  const data = JSON.parse(localStorage.getItem("virtueData") || "{}");
  
  // 检查今天是否有打卡
  let todayChecked = false;
  virtues.forEach((virtue, rowIndex) => {
    for (let day = 0; day < 7; day++) {
      const key = `${currentWeek}-${rowIndex}-${day}`;
      if (data[key]) {
        todayChecked = true;
      }
    }
  });

  if (todayChecked) {
    if (streakData.lastDate !== today) {
      if (streakData.lastDate === null || 
          new Date(streakData.lastDate).getTime() === new Date(today).getTime() - 24 * 60 * 60 * 1000) {
        streakData.current++;
        if (streakData.current > streakData.best) {
          streakData.best = streakData.current;
        }
      } else {
        streakData.current = 1;
      }
      streakData.lastDate = today;
      localStorage.setItem("streakData", JSON.stringify(streakData));
    }
  }
}

// 更换专注美德
function changeFocus() {
  const modal = document.getElementById("virtueModal");
  const content = document.getElementById("modalContent");
  
  let html = '<h2>选择本周专注的美德</h2>';
  html += '<div style="display: grid; gap: 10px; margin-top: 20px;">';
  
  virtues.forEach((virtue, index) => {
    const isSelected = index === currentFocus;
    html += `
      <div style="padding: 15px; border: 2px solid ${isSelected ? '#4299e1' : '#e2e8f0'}; 
                  border-radius: 8px; cursor: pointer; background: ${isSelected ? '#ebf8ff' : 'white'};"
           onclick="selectFocus(${index})">
        <div style="font-weight: bold; margin-bottom: 5px;">${virtue.name}</div>
        <div style="font-size: 0.9rem; color: #718096;">${virtue.desc}</div>
      </div>
    `;
  });
  
  html += '</div>';
  content.innerHTML = html;
  modal.style.display = "block";
}

// 选择专注美德
function selectFocus(index) {
  currentFocus = index;
  localStorage.setItem("currentFocus", index);
  updateFocusProgress();
  closeModal();
}

// 重置本周数据
function resetWeek() {
  if (confirm("确定要重置本周的所有打卡数据吗？")) {
    const data = JSON.parse(localStorage.getItem("virtueData") || "{}");
    
    // 删除本周数据
    Object.keys(data).forEach(key => {
      if (key.startsWith(displayWeek + "-")) {
        delete data[key];
      }
    });
    
    localStorage.setItem("virtueData", JSON.stringify(data));
    
    // 重新加载表格
    loadData();
    updateStats();
    updateFocusProgress();
  }
}

// 上一周
function previousWeek() {
  displayWeek--;
  loadData();
  updateStats();
  updateFocusProgress();
}

// 下一周
function nextWeek() {
  displayWeek++;
  loadData();
  updateStats();
  updateFocusProgress();
}

// 回到本周
function goToCurrentWeek() {
  displayWeek = currentWeek;
  loadData();
  updateStats();
  updateFocusProgress();
}

// 显示美德详情
function showVirtueDetail(index) {
  const virtue = virtues[index];
  const modal = document.getElementById("virtueModal");
  const content = document.getElementById("modalContent");
  
  let html = `
    <h2>${virtue.name}</h2>
    <div class="virtue-detail">
      <h3>📖 美德描述</h3>
      <p>${virtue.desc}</p>
    </div>
    <div class="virtue-detail">
      <h3>💡 实践建议</h3>
      <ul class="tips-list">
  `;
  
  virtue.tips.forEach(tip => {
    html += `<li>${tip}</li>`;
  });
  
  html += `
      </ul>
    </div>
    <div style="margin-top: 20px;">
      <button class="btn btn-primary" onclick="selectFocus(${index})">设为本周专注</button>
    </div>
  `;
  
  content.innerHTML = html;
  modal.style.display = "block";
}

// 关闭模态框
function closeModal() {
  document.getElementById("virtueModal").style.display = "none";
}

// 保存笔记
function saveNote() {
  const noteInput = document.getElementById("noteInput");
  const content = noteInput.value.trim();
  
  if (content) {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    const note = {
      id: Date.now(),
      content: content,
      date: new Date().toLocaleString(),
      timestamp: Date.now()
    };
    
    notes.unshift(note);
    localStorage.setItem("notes", JSON.stringify(notes));
    
    noteInput.value = "";
    loadNotes();
  }
}

// 加载笔记
function loadNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  const notesList = document.getElementById("notesList");
  
  notesList.innerHTML = "";
  
  notes.slice(0, 5).forEach(note => {
    const noteElement = document.createElement("div");
    noteElement.className = "note-item";
    noteElement.innerHTML = `
      <div class="note-date">${note.date}</div>
      <div class="note-content">${note.content}</div>
    `;
    notesList.appendChild(noteElement);
  });
}

// 加载历史数据
function loadData() {
  const data = JSON.parse(localStorage.getItem("virtueData") || "{}");
  document.querySelectorAll("#virtueTable tbody td").forEach(cell => {
    if (cell.textContent === "○" && cell.cellIndex > 0) {
      const rowIndex = cell.parentNode.rowIndex;
      const day = cell.cellIndex - 1;
      const key = `${displayWeek}-${rowIndex}-${day}`;
      if (data[key]) {
        cell.textContent = "✓";
        cell.classList.add("checked");
      }
    }
  });
  
  // 更新表格周数显示
  document.getElementById("tableWeekDisplay").textContent = displayWeek;
}

// 加载设置
function loadSettings() {
  // 加载专注美德
  const savedFocus = localStorage.getItem("currentFocus");
  if (savedFocus !== null) {
    currentFocus = parseInt(savedFocus);
  }
  
  // 加载连续打卡数据
  const savedStreak = localStorage.getItem("streakData");
  if (savedStreak) {
    streakData = JSON.parse(savedStreak);
  }
}

// 导出数据
function exportData() {
  const data = {
    virtues: virtues,
    currentFocus: currentFocus,
    streakData: streakData,
    virtueData: JSON.parse(localStorage.getItem("virtueData") || "{}"),
    notes: JSON.parse(localStorage.getItem("notes") || "[]"),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `富兰克林美德数据_${new Date().toLocaleDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 导入数据
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          if (data.virtueData) {
            localStorage.setItem("virtueData", JSON.stringify(data.virtueData));
          }
          if (data.notes) {
            localStorage.setItem("notes", JSON.stringify(data.notes));
          }
          if (data.streakData) {
            localStorage.setItem("streakData", JSON.stringify(data.streakData));
          }
          if (data.currentFocus !== undefined) {
            localStorage.setItem("currentFocus", data.currentFocus.toString());
          }
          
          loadData();
          loadSettings();
          updateStats();
          updateFocusProgress();
          loadNotes();
          
          alert("数据导入成功！");
        } catch (error) {
          alert("数据格式错误，导入失败！");
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

// 添加键盘快捷键
document.addEventListener('keydown', function(e) {
  // Ctrl+S 保存笔记
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveNote();
  }
  // Esc 关闭模态框
  if (e.key === 'Escape') {
    closeModal();
  }
});

// 点击模态框外部关闭
window.addEventListener('click', function(e) {
  const modal = document.getElementById("virtueModal");
  if (e.target === modal) {
    closeModal();
  }
});

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  initTable();
  loadData();
  updateStats();
  updateFocusProgress();
  updateWeekDisplay();
  loadNotes();
  
  // 添加导出导入按钮到页面
  const header = document.querySelector('.header');
  const exportButtons = document.createElement('div');
  exportButtons.style.cssText = 'margin-top: 20px; display: flex; gap: 10px; justify-content: center;';
  exportButtons.innerHTML = `
    <button class="btn btn-primary" onclick="exportData()">📤 导出数据</button>
    <button class="btn btn-secondary" onclick="importData()">📥 导入数据</button>
  `;
  header.appendChild(exportButtons);
});