// Vue 3 应用 - 富兰克林13美德养成系统
const { createApp, ref, computed, onMounted } = Vue;

// 13 项美德数据
const virtuesData = [
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

// 工具函数
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
};

const getWeekDateRange = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return { monday, sunday };
};

const formatDate = (date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 创建Vue应用
createApp({
  setup() {
    // 响应式数据
    const virtues = ref(virtuesData);
    const currentWeek = ref(getCurrentWeek());
    const displayWeek = ref(currentWeek.value);
    const currentFocus = ref(0);
    const showModal = ref(false);
    const selectedVirtue = ref(null);
    const selectedVirtueIndex = ref(0);
    const newNote = ref('');
    
    // 从localStorage加载数据
    const loadFromStorage = (key, defaultValue) => {
      try {
        const stored = localStorage.getItem(key);
        if (!stored) return defaultValue;
        
        const parsed = JSON.parse(stored);
        return parsed !== null && parsed !== undefined ? parsed : defaultValue;
      } catch (error) {
        console.error(`加载数据 ${key} 失败:`, error);
        return defaultValue;
      }
    };
    
    // 保存到localStorage
    const saveToStorage = (key, value) => {
      try {
        if (value === undefined || value === null) {
          console.warn(`尝试保存无效值到 ${key}`);
          return false;
        }
        
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
      } catch (error) {
        console.error(`保存数据到 ${key} 失败:`, error);
        // 如果是存储空间不足错误，提示用户
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          alert('本地存储空间已满，请清理一些数据后再试');
        }
        return false;
      }
    };
    
    // 初始化数据
    const streakData = ref(loadFromStorage('streakData', { current: 0, best: 0, lastDate: null }));
    const notes = ref(loadFromStorage('notes', []));
    
    // 加载设置
    const savedFocus = loadFromStorage('currentFocus', 0);
    currentFocus.value = savedFocus;
    
    // 计算属性
    const weekDateRange = computed(() => {
      const range = getWeekDateRange();
      return `${formatDate(range.monday)} - ${formatDate(range.sunday)}`;
    });
    
    const totalChecked = computed(() => {
      let count = 0;
      
      virtues.value.forEach((virtue, rowIndex) => {
        for (let day = 0; day < 7; day++) {
          const key = `${displayWeek.value}-${rowIndex}-${day}`;
          if (virtueData.value[key]) count++;
        }
      });
      
      return count;
    });
    
    const completionRate = computed(() => {
      const total = virtues.value.length * 7;
      return total > 0 ? Math.round((totalChecked.value / total) * 100) : 0;
    });
    
    const focusCheckedDays = computed(() => {
      let count = 0;
      
      for (let day = 0; day < 7; day++) {
        const key = `${displayWeek.value}-${currentFocus.value}-${day}`;
        if (virtueData.value[key]) count++;
      }
      
      return count;
    });
    
    const focusProgressPercent = computed(() => {
      return (focusCheckedDays.value / 7) * 100;
    });
    
    const recentNotes = computed(() => {
      return notes.value.slice(0, 5);
    });
    
    const weekStatusText = computed(() => {
      if (displayWeek.value < currentWeek.value) {
        return "(历史周)";
      } else if (displayWeek.value === currentWeek.value) {
        return "(本周)";
      } else {
        return "(未来周)";
      }
    });
    
    // 使用ref存储virtueData，而不是computed，以便可以直接修改
    const virtueData = ref(loadFromStorage('virtueData', {}));
    
    // 方法
    const isChecked = (rowIndex, day) => {
      const key = `${displayWeek.value}-${rowIndex}-${day}`;
      return !!virtueData.value[key];
    };
    
    const toggleCheck = (rowIndex, day) => {
      const key = `${displayWeek.value}-${rowIndex}-${day}`;
      // 直接修改ref的值，确保UI立即更新
      virtueData.value[key] = !virtueData.value[key];
      saveToStorage('virtueData', virtueData.value);
      
      // 更新连续打卡
      updateStreak();
    };
    
    const updateStreak = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 设置时间为当天的0点，便于比较
      const todayString = today.toDateString();
      
      // 检查今天是否有打卡
      let todayChecked = false;
      // 使用普通for循环代替forEach，这样可以使用break跳出循环
      outerLoop: for (let rowIndex = 0; rowIndex < virtues.value.length; rowIndex++) {
        for (let day = 0; day < 7; day++) {
          const key = `${currentWeek.value}-${rowIndex}-${day}`;
          if (virtueData.value[key]) {
            todayChecked = true;
            break outerLoop; // 使用标签跳出嵌套循环
          }
        }
      }
      
      if (todayChecked) {
        if (streakData.value.lastDate !== todayString) {
          // 计算上次打卡日期
          let lastDate = null;
          if (streakData.value.lastDate) {
            lastDate = new Date(streakData.value.lastDate);
            lastDate.setHours(0, 0, 0, 0);
          }
          
          // 检查是否是连续打卡
          const isConsecutive = lastDate === null || 
                               (today.getTime() - lastDate.getTime()) === 24 * 60 * 60 * 1000;
          
          if (isConsecutive) {
            streakData.value.current++;
            if (streakData.value.current > streakData.value.best) {
              streakData.value.best = streakData.value.current;
            }
          } else {
            streakData.value.current = 1;
          }
          
          streakData.value.lastDate = todayString;
          saveToStorage('streakData', streakData.value);
        }
      }
    };
    
    const showVirtueDetail = (index) => {
      selectedVirtue.value = virtues.value[index];
      selectedVirtueIndex.value = index;
      showModal.value = true;
    };
    
    const closeModal = () => {
      showModal.value = false;
    };
    
    const selectFocus = (index) => {
      currentFocus.value = index;
      saveToStorage('currentFocus', index);
      closeModal();
    };
    
    const changeFocus = () => {
      showVirtueDetail(currentFocus.value);
    };
    
    const resetWeek = () => {
      if (confirm("确定要重置本周的所有打卡数据吗？")) {
        try {
          // 删除本周数据
          Object.keys(virtueData.value).forEach(key => {
            if (key.startsWith(displayWeek.value + "-")) {
              delete virtueData.value[key];
            }
          });
          
          // 创建一个新对象触发响应式更新
          virtueData.value = {...virtueData.value};
          saveToStorage('virtueData', virtueData.value);
          console.log(`第${displayWeek.value}周数据已重置`);
        } catch (error) {
          console.error('重置周数据失败:', error);
          alert('重置数据时发生错误，请稍后再试');
        }
      }
    };
    
    const previousWeek = () => {
      displayWeek.value--;
    };
    
    const nextWeek = () => {
      // 不允许进入未来的周数
      if (displayWeek.value < currentWeek.value) {
        displayWeek.value++;
      } else if (displayWeek.value === currentWeek.value) {
        alert("已经是当前周，不能进入未来的周数！");
      }
    };
    
    const goToCurrentWeek = () => {
      displayWeek.value = currentWeek.value;
    };
    
    const saveNote = () => {
      if (newNote.value.trim()) {
        const note = {
          id: Date.now(),
          content: newNote.value.trim(),
          date: new Date().toLocaleString(),
          timestamp: Date.now()
        };
        
        notes.value.unshift(note);
        saveToStorage('notes', notes.value);
        newNote.value = '';
      }
    };
    
    // 键盘快捷键
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveNote();
      }
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    
    // 生命周期
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown);
    });
    
    // 数据导出功能
    const exportData = () => {
      try {
        const dataToExport = {
          virtueData: virtueData.value,
          streakData: streakData.value,
          notes: notes.value,
          currentFocus: currentFocus.value,
          exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(dataToExport);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileName = `franklin-virtues-backup-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        return true;
      } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出数据失败，请稍后再试');
        return false;
      }
    };
    
    // 数据导入功能
    const importData = (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            
            // 验证导入的数据格式
            if (!importedData.virtueData || !importedData.streakData) {
              throw new Error('导入的数据格式不正确');
            }
            
            // 确认导入
            if (confirm(`确定要导入 ${importedData.exportDate ? new Date(importedData.exportDate).toLocaleString() : '未知日期'} 的数据吗？这将覆盖当前数据。`)) {
              // 保存导入的数据
              saveToStorage('virtueData', importedData.virtueData);
              saveToStorage('streakData', importedData.streakData);
              saveToStorage('notes', importedData.notes || []);
              saveToStorage('currentFocus', importedData.currentFocus || 0);
              
              // 直接更新响应式数据，无需刷新页面
              virtueData.value = importedData.virtueData;
              streakData.value = importedData.streakData;
              notes.value = importedData.notes || [];
              currentFocus.value = importedData.currentFocus || 0;
              
              alert('数据导入成功！');
            }
          } catch (error) {
            console.error('解析导入数据失败:', error);
            alert('导入的文件格式不正确，请选择有效的备份文件');
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('导入数据失败:', error);
        alert('导入数据失败，请稍后再试');
      }
    };
    
    // 创建文件输入元素
    const createImportInput = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = importData;
      input.click();
    };
    
    return {
      // 数据
      virtues,
      currentWeek,
      displayWeek,
      currentFocus,
      showModal,
      selectedVirtue,
      selectedVirtueIndex,
      newNote,
      streakData,
      notes,
      
      // 计算属性
      weekDateRange,
      totalChecked,
      completionRate,
      focusCheckedDays,
      focusProgressPercent,
      recentNotes,
      weekStatusText,
      
      // 方法
      isChecked,
      toggleCheck,
      showVirtueDetail,
      closeModal,
      selectFocus,
      changeFocus,
      resetWeek,
      previousWeek,
      nextWeek,
      goToCurrentWeek,
      saveNote,
      exportData,
      createImportInput
    };
  }
}).mount('#app');