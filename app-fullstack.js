// Vue 3 应用 - 富兰克林13美德养成系统 - 全栈版
const { createApp, ref, computed, onMounted, watch } = Vue;

// API配置
const API_BASE_URL = 'http://localhost:3003/api';

// API工具函数
const api = {
  // 获取认证头
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // 通用请求方法
  async request(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: this.getAuthHeaders(),
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '请求失败');
      }
      
      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  },

  // 认证相关
  auth: {
    register: (userData) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    
    getMe: () => api.request('/auth/me'),
    
    verify: () => api.request('/auth/verify', { method: 'POST' })
  },

  // 美德记录相关
  virtues: {
    getRecord: (date) => api.request(`/virtues/records/${date}`),
    
    getWeekRecords: (year, week) => api.request(`/virtues/records/week/${year}/${week}`),
    
    updateVirtue: (date, virtueData) => api.request(`/virtues/records/${date}/virtue`, {
      method: 'PUT',
      body: JSON.stringify(virtueData)
    }),
    
    updateReflection: (date, reflectionData) => api.request(`/virtues/records/${date}/reflection`, {
      method: 'PUT',
      body: JSON.stringify(reflectionData)
    }),
    
    getStats: () => api.request('/virtues/stats'),
    
    getDefinitions: () => api.request('/virtues/definitions')
  },

  // 用户相关
  users: {
    updateSettings: (userId, settings) => api.request(`/users/${userId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }
};

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
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
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
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};

// Vue应用
createApp({
  setup() {
    // 认证相关状态
    const user = ref(null);
    const loading = ref(true);
    const isLogin = ref(true);
    const authForm = ref({
      username: '',
      email: '',
      password: ''
    });
    const authError = ref('');
    const authSuccess = ref('');
    const authLoading = ref(false);

    // 应用状态
    const virtues = ref(virtuesData);
    const currentWeek = ref(getCurrentWeek());
    const displayWeek = ref(currentWeek.value);
    const currentFocus = ref(0);
    const showModal = ref(false);
    const selectedVirtue = ref(null);
    const selectedVirtueIndex = ref(0);
    const todayNote = ref('');
    const streakData = ref({ current: 0, best: 0 });
    const weekRecords = ref([]);

    // 计算属性
    const weekDateRange = computed(() => {
      const range = getWeekDateRange();
      return `${formatDate(range.monday)} - ${formatDate(range.sunday)}`;
    });

    const weekDays = computed(() => {
      const now = new Date();
      const currentDay = now.getDay();
      const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
      
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset);
      
      const weekDiff = displayWeek.value - currentWeek.value;
      const displayMonday = new Date(monday);
      displayMonday.setDate(monday.getDate() + (weekDiff * 7));
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(displayMonday);
        day.setDate(displayMonday.getDate() + i);
        days.push({
          dayOfWeek: `星期${i + 1}`,
          date: `${day.getMonth() + 1}/${day.getDate()}`,
          dayIndex: i,
          fullDate: day
        });
      }
      return days;
    });

    const totalChecked = computed(() => {
      return weekRecords.value.reduce((total, record) => {
        return total + (record?.stats?.completedCount || 0);
      }, 0);
    });

    const completionRate = computed(() => {
      const totalPossible = weekRecords.value.length * 13;
      return totalPossible > 0 ? Math.round((totalChecked.value / totalPossible) * 100) : 0;
    });

    // 认证方法
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          loading.value = false;
          return;
        }

        const response = await api.auth.verify();
        user.value = response.user;
        await loadUserData();
      } catch (error) {
        console.error('认证检查失败:', error);
        localStorage.removeItem('authToken');
      } finally {
        loading.value = false;
      }
    };

    const handleAuth = async () => {
      authError.value = '';
      authSuccess.value = '';
      authLoading.value = true;

      try {
        let response;
        if (isLogin.value) {
          response = await api.auth.login({
            email: authForm.value.email,
            password: authForm.value.password
          });
        } else {
          response = await api.auth.register({
            username: authForm.value.username,
            email: authForm.value.email,
            password: authForm.value.password
          });
        }

        localStorage.setItem('authToken', response.token);
        user.value = response.user;
        currentFocus.value = response.user.settings?.currentFocus || 0;
        
        authSuccess.value = isLogin.value ? '登录成功！' : '注册成功！';
        
        // 加载用户数据
        await loadUserData();
        
      } catch (error) {
        authError.value = error.message;
      } finally {
        authLoading.value = false;
      }
    };

    const toggleAuthMode = () => {
      isLogin.value = !isLogin.value;
      authError.value = '';
      authSuccess.value = '';
      authForm.value = { username: '', email: '', password: '' };
    };

    const logout = () => {
      localStorage.removeItem('authToken');
      user.value = null;
      weekRecords.value = [];
      streakData.value = { current: 0, best: 0 };
    };

    // 数据加载方法
    const loadUserData = async () => {
      try {
        await Promise.all([
          loadWeekRecords(),
          loadStats()
        ]);
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    };

    const loadWeekRecords = async () => {
      try {
        const year = new Date().getFullYear();
        const week = displayWeek.value;
        const response = await api.virtues.getWeekRecords(year, week);
        weekRecords.value = response.records || [];
      } catch (error) {
        console.error('加载周记录失败:', error);
        weekRecords.value = [];
      }
    };

    const loadStats = async () => {
      try {
        const response = await api.virtues.getStats();
        streakData.value = {
          current: response.stats.currentStreak || 0,
          best: response.stats.bestStreak || 0
        };
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    };

    const loadTodayRecord = async () => {
      try {
        const today = formatDateForAPI(new Date());
        const response = await api.virtues.getRecord(today);
        todayNote.value = response.record?.dailyReflection || '';
      } catch (error) {
        console.error('加载今日记录失败:', error);
      }
    };

    // 美德操作方法
    const getVirtueStatus = (virtueIndex, dayIndex) => {
      const record = weekRecords.value[dayIndex];
      if (!record || !record.virtues) return false;
      
      const virtue = record.virtues.get ? 
        record.virtues.get(virtueIndex.toString()) : 
        record.virtues[virtueIndex.toString()];
      
      return virtue?.completed || false;
    };

    const updateVirtueStatus = async (virtueIndex, dayIndex, completed) => {
      try {
        const day = weekDays.value[dayIndex];
        const date = formatDateForAPI(day.fullDate);
        
        await api.virtues.updateVirtue(date, {
          virtueIndex,
          completed,
          note: ''
        });
        
        // 重新加载数据
        await loadWeekRecords();
        await loadStats();
        
      } catch (error) {
        console.error('更新美德状态失败:', error);
        // 回滚状态
        await loadWeekRecords();
      }
    };

    const updateFocus = async () => {
      try {
        await api.users.updateSettings(user.value.id, {
          currentFocus: currentFocus.value
        });
      } catch (error) {
        console.error('更新专注美德失败:', error);
      }
    };

    const saveTodayNote = async () => {
      try {
        const today = formatDateForAPI(new Date());
        await api.virtues.updateReflection(today, {
          reflection: todayNote.value
        });
      } catch (error) {
        console.error('保存今日笔记失败:', error);
      }
    };

    // 导航方法
    const previousWeek = () => {
      if (displayWeek.value > 1) {
        displayWeek.value--;
      }
    };

    const nextWeek = () => {
      if (displayWeek.value < currentWeek.value) {
        displayWeek.value++;
      }
    };

    // 模态框方法
    const openVirtueModal = (virtue, index) => {
      selectedVirtue.value = virtue;
      selectedVirtueIndex.value = index;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      selectedVirtue.value = null;
    };

    // 激励文案
    const getStreakMotivation = () => {
      const current = streakData.value.current;
      if (current === 0) return '开始你的美德之旅！';
      if (current < 7) return '坚持就是胜利！';
      if (current < 30) return '习惯正在养成中...';
      if (current < 100) return '你已经很棒了！';
      return '美德大师！';
    };

    // 监听displayWeek变化
    watch(displayWeek, () => {
      if (user.value) {
        loadWeekRecords();
      }
    });

    // 组件挂载
    onMounted(async () => {
      await checkAuth();
      if (user.value) {
        await loadTodayRecord();
      }
    });

    return {
      // 认证相关
      user,
      loading,
      isLogin,
      authForm,
      authError,
      authSuccess,
      authLoading,
      handleAuth,
      toggleAuthMode,
      logout,
      
      // 应用状态
      virtues,
      currentWeek,
      displayWeek,
      currentFocus,
      showModal,
      selectedVirtue,
      selectedVirtueIndex,
      todayNote,
      streakData,
      
      // 计算属性
      weekDateRange,
      weekDays,
      totalChecked,
      completionRate,
      
      // 方法
      getVirtueStatus,
      updateVirtueStatus,
      updateFocus,
      saveTodayNote,
      previousWeek,
      nextWeek,
      openVirtueModal,
      closeModal,
      getStreakMotivation
    };
  }
}).mount('#app');