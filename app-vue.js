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
        return stored ? JSON.parse(stored) : defaultValue;
      } catch {
        return defaultValue;
      }
    };
    
    // 保存到localStorage
    const saveToStorage = (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('保存数据失败:', error);
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
      const data = loadFromStorage('virtueData', {});
      
      virtues.value.forEach((virtue, rowIndex) => {
        for (let day = 0; day < 7; day++) {
          const key = `${displayWeek.value}-${rowIndex}-${day}`;
          if (data[key]) count++;
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
      const data = loadFromStorage('virtueData', {});
      
      for (let day = 0; day < 7; day++) {
        const key = `${displayWeek.value}-${currentFocus.value}-${day}`;
        if (data[key]) count++;
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
    
    // 方法
    const isChecked = (rowIndex, day) => {
      const data = loadFromStorage('virtueData', {});
      const key = `${displayWeek.value}-${rowIndex}-${day}`;
      return !!data[key];
    };
    
    const toggleCheck = (rowIndex, day) => {
      const data = loadFromStorage('virtueData', {});
      const key = `${displayWeek.value}-${rowIndex}-${day}`;
      data[key] = !data[key];
      saveToStorage('virtueData', data);
      
      // 更新连续打卡
      updateStreak();
    };
    
    const updateStreak = () => {
      const today = new Date().toDateString();
      const data = loadFromStorage('virtueData', {});
      
      // 检查今天是否有打卡
      let todayChecked = false;
      virtues.value.forEach((virtue, rowIndex) => {
        for (let day = 0; day < 7; day++) {
          const key = `${currentWeek.value}-${rowIndex}-${day}`;
          if (data[key]) {
            todayChecked = true;
          }
        }
      });
      
      if (todayChecked) {
        if (streakData.value.lastDate !== today) {
          if (streakData.value.lastDate === null || 
              new Date(streakData.value.lastDate).getTime() === new Date(today).getTime() - 24 * 60 * 60 * 1000) {
            streakData.value.current++;
            if (streakData.value.current > streakData.value.best) {
              streakData.value.best = streakData.value.current;
            }
          } else {
            streakData.value.current = 1;
          }
          streakData.value.lastDate = today;
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
        const data = loadFromStorage('virtueData', {});
        
        // 删除本周数据
        Object.keys(data).forEach(key => {
          if (key.startsWith(displayWeek.value + "-")) {
            delete data[key];
          }
        });
        
        saveToStorage('virtueData', data);
      }
    };
    
    const previousWeek = () => {
      // 不允许周数小于1
      if (displayWeek.value > 1) {
        displayWeek.value--;
      } else {
        alert("不能查看第0周或负数周！");
      }
    };
    
    const nextWeek = () => {
      // 不允许进入未来的周数
      if (displayWeek.value < currentWeek.value) {
        displayWeek.value++;
      } else {
        alert("不能进入未来的周数！");
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
      saveNote
    };
  }
}).mount('#app'); 