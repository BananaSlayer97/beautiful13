// Vue 3 应用 - 富兰克林13美德养成系统 - 全栈版
const { createApp, ref, computed, onMounted, watch } = Vue;

// 从共享工具中获取数据和函数
const { virtuesData, getCurrentWeek, getWeekDateRange, formatDate, formatDateForAPI } = window.SharedUtils;

// API配置 - 根据环境自动适配
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3003/api' 
  : '/api';

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
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('🔗 API请求:', fullUrl);
    
    try {
      const response = await fetch(fullUrl, {
        headers: this.getAuthHeaders(),
        ...options
      });
      
      console.log('📡 响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 响应错误:', errorText);
        throw new Error(`请求失败 (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ 响应数据:', data);
      
      return data;
    } catch (error) {
      console.error('🚨 API请求错误:', {
        url: fullUrl,
        error: error.message,
        stack: error.stack
      });
      
      // 提供更友好的错误信息
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络或稍后重试');
      }
      
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
      
      const dayNames = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(displayMonday);
        day.setDate(displayMonday.getDate() + i);
        days.push({
          dayOfWeek: dayNames[i],
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
      const day = weekDays.value[dayIndex];
      if (!day) return false;
      
      // 根据日期查找对应的记录
      const record = weekRecords.value.find(r => {
        const recordDate = new Date(r.date);
        const dayDate = new Date(day.fullDate);
        return recordDate.getFullYear() === dayDate.getFullYear() &&
               recordDate.getMonth() === dayDate.getMonth() &&
               recordDate.getDate() === dayDate.getDate();
      });
      
      if (!record || !record.virtues) return false;
      
      const virtue = record.virtues.get ? 
        record.virtues.get(virtueIndex.toString()) : 
        record.virtues[virtueIndex.toString()];
      
      return virtue?.completed || false;
    };

    // 检查是否是今天
    const isToday = (date) => {
      const today = new Date();
      const checkDate = new Date(date);
      return today.getFullYear() === checkDate.getFullYear() &&
             today.getMonth() === checkDate.getMonth() &&
             today.getDate() === checkDate.getDate();
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

    // 检查某个日期是否可以点击（所有日期都可以点击）
    const canClickDate = (dayIndex) => {
      return true;
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
      weekRecords,
      
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
      getStreakMotivation,
      canClickDate,
      isToday
    };
  }
}).mount('#app');