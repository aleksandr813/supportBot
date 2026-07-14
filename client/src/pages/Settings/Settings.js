import React, { useContext, useState, useEffect } from 'react';
import { ServerContext, MediatorContext } from '../../App';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Trash2, Edit, Plus, Check, X, UserX, UserCheck, Bot as BotIcon, RefreshCw, AlertTriangle } from 'lucide-react';

import './Settings.css';

export default function Settings({ setPage, PAGES }) {
  const server = useContext(ServerContext);
  const mediator = useContext(MediatorContext);

  const [activeTab, setActiveTab] = useState('bots'); // 'bots' | 'blocked'
  
  // Bots state
  const [bots, setBots] = useState([]);
  const [editingBotGuid, setEditingBotGuid] = useState(null);
  const [editForm, setEditForm] = useState({ token: '', adress: '', port: '' });
  const [newBotForm, setNewBotForm] = useState({ token: '', adress: 'localhost', port: '3004' });
  const [botError, setBotError] = useState('');

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [newBlockForm, setNewBlockForm] = useState({ externalId: '', botGuid: '' });
  const [userError, setUserError] = useState('');

  const handleNavigate = (key) => {
    if (key === 'chats') {
      setPage(PAGES.CHATS);
    } else if (key === 'settings') {
      setPage(PAGES.SETTINGS);
    }
  };

  const handleLogout = () => {
    server.logout();
    setPage(PAGES.LOGIN);
  };

  // Fetch initial data
  useEffect(() => {
    if (!mediator) return;

    const { GET_BOTS, ADD_BOT, UPDATE_BOT, DELETE_BOT, GET_BLOCKED_USERS, BLOCK_USER } = mediator.getEventTypes();

    const handleGetBots = (res) => {
      if (res.result === 'ok') {
        setBots(res.data);
      } else {
        setBotError(res.error?.message || 'Ошибка загрузки ботов');
      }
    };

    const handleAddBot = (res) => {
      if (res.result === 'ok') {
        setBots(prev => [...prev, res.data]);
        setNewBotForm({ token: '', adress: 'localhost', port: '3004' });
        setBotError('');
      } else {
        setBotError(res.error?.message || 'Ошибка добавления бота');
      }
    };

    const handleUpdateBot = (res) => {
      if (res.result === 'ok') {
        setBots(prev => prev.map(b => b.bot_guid === res.data.bot_guid ? res.data : b));
        setEditingBotGuid(null);
        setBotError('');
      } else {
        setBotError(res.error?.message || 'Ошибка обновления бота');
      }
    };

    const handleDeleteBot = (res) => {
      if (res.result === 'ok') {
        setBots(prev => prev.filter(b => b.bot_guid !== res.data.guid));
        setBotError('');
      } else {
        setBotError(res.error?.message || 'Ошибка удаления бота');
        alert(res.error?.message || 'Не удалось удалить бота');
      }
    };

    const handleGetBlockedUsers = (res) => {
      if (res.result === 'ok') {
        setBlockedUsers(res.data);
      } else {
        setUserError(res.error?.message || 'Ошибка загрузки черного списка');
      }
    };

    const handleBlockUser = (res) => {
      if (res.result === 'ok') {
        const { externalId, botGuid, isBlocked } = res.data;
        if (isBlocked) {
          // If blocking, refresh full list or add if we had enough info (but listing is safer)
          server.getBlockedUsers();
          setNewBlockForm({ externalId: '', botGuid: bots[0]?.bot_guid || '' });
        } else {
          // If unblocking, remove from local list
          setBlockedUsers(prev => prev.filter(u => !(u.externalId === externalId && u.botGuid === botGuid)));
        }
        setUserError('');
      } else {
        setUserError(res.error?.message || 'Ошибка изменения статуса блокировки');
      }
    };

    mediator.subscribe(GET_BOTS, handleGetBots);
    mediator.subscribe(ADD_BOT, handleAddBot);
    mediator.subscribe(UPDATE_BOT, handleUpdateBot);
    mediator.subscribe(DELETE_BOT, handleDeleteBot);
    mediator.subscribe(GET_BLOCKED_USERS, handleGetBlockedUsers);
    mediator.subscribe(BLOCK_USER, handleBlockUser);

    // Initial load
    server.getBots();
    server.getBlockedUsers();

    return () => {
      mediator.unsubscribe(GET_BOTS, handleGetBots);
      mediator.unsubscribe(ADD_BOT, handleAddBot);
      mediator.unsubscribe(UPDATE_BOT, handleUpdateBot);
      mediator.unsubscribe(DELETE_BOT, handleDeleteBot);
      mediator.unsubscribe(GET_BLOCKED_USERS, handleGetBlockedUsers);
      mediator.unsubscribe(BLOCK_USER, handleBlockUser);
    };
  }, [mediator]);

  // Set default botGuid when bots load
  useEffect(() => {
    if (bots.length > 0 && !newBlockForm.botGuid) {
      setNewBlockForm(prev => ({ ...prev, botGuid: bots[0].bot_guid }));
    }
  }, [bots]);

  // Bots Actions
  const handleAddBotSubmit = (e) => {
    e.preventDefault();
    if (!newBotForm.token || !newBotForm.adress || !newBotForm.port) {
      setBotError('Заполните все поля нового бота');
      return;
    }
    server.addBot(newBotForm);
  };

  const startEditBot = (bot) => {
    setEditingBotGuid(bot.bot_guid);
    setEditForm({
      token: bot.token,
      adress: bot.adress,
      port: bot.port.toString(),
    });
  };

  const handleUpdateBotSubmit = (guid) => {
    if (!editForm.token || !editForm.adress || !editForm.port) {
      setBotError('Поля бота не могут быть пустыми');
      return;
    }
    server.updateBot({
      guid,
      token: editForm.token,
      adress: editForm.adress,
      port: editForm.port,
    });
  };

  const handleDeleteBotClick = (guid) => {
    if (bots.length <= 1) {
      alert('Нельзя удалить бота, если он единственный в системе!');
      return;
    }
    if (window.confirm('Вы уверены, что хотите удалить этого бота? Все связанные диалоги могут быть повреждены.')) {
      server.deleteBot({ guid });
    }
  };

  // Block User Actions
  const handleBlockUserSubmit = (e) => {
    e.preventDefault();
    if (!newBlockForm.externalId || !newBlockForm.botGuid) {
      setUserError('Введите External ID пользователя и выберите бота');
      return;
    }
    server.blockUser({
      externalId: newBlockForm.externalId,
      botGuid: newBlockForm.botGuid,
      isBlocked: true,
    });
  };

  const handleUnblockUserClick = (externalId, botGuid) => {
    server.blockUser({
      externalId,
      botGuid,
      isBlocked: false,
    });
  };

  return (
    <div className="settings-block">
      <Sidebar onNavigate={handleNavigate} onLogout={handleLogout} defaultActive="settings" />

      <div className="settings-content">
        <header className="settings-content__header">
          <h1 className="settings-content__title">Настройки системы</h1>
        </header>

        <div className="settings-tabs">
          <button
            className={`settings-tabs__btn ${activeTab === 'bots' ? 'settings-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab('bots')}
          >
            <BotIcon size={18} />
            <span>Управление ботами</span>
          </button>
          <button
            className={`settings-tabs__btn ${activeTab === 'blocked' ? 'settings-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab('blocked')}
          >
            <UserX size={18} />
            <span>Черный список ({blockedUsers.length})</span>
          </button>
        </div>

        {activeTab === 'bots' && (
          <div className="settings-section">
            <div className="settings-section__card">
              <h2 className="settings-section__card-title">Список активных ботов</h2>
              
              {botError && <div className="settings-error"><AlertTriangle size={16} /> {botError}</div>}

              <div className="bots-table-wrapper">
                <table className="bots-table">
                  <thead>
                    <tr>
                      <th>GUID</th>
                      <th>Токен бота</th>
                      <th>Адрес хоста</th>
                      <th>Порт</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bots.map((bot) => {
                      const isEditing = editingBotGuid === bot.bot_guid;
                      return (
                        <tr key={bot.bot_guid} className={isEditing ? 'row-editing' : ''}>
                          <td className="bot-guid" title={bot.bot_guid}>{bot.bot_guid.substring(0, 8)}...</td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="table-input"
                                value={editForm.token}
                                onChange={(e) => setEditForm({ ...editForm, token: e.target.value })}
                              />
                            ) : (
                              <span className="token-span" title={bot.token}>{bot.token.substring(0, 15)}...</span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="table-input"
                                value={editForm.adress}
                                onChange={(e) => setEditForm({ ...editForm, adress: e.target.value })}
                              />
                            ) : (
                              bot.adress
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                className="table-input table-input--port"
                                value={editForm.port}
                                onChange={(e) => setEditForm({ ...editForm, port: e.target.value })}
                              />
                            ) : (
                              bot.port
                            )}
                          </td>
                          <td>
                            <div className="table-actions">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateBotSubmit(bot.bot_guid)}
                                    className="action-btn action-btn--save"
                                    title="Сохранить изменения"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => setEditingBotGuid(null)}
                                    className="action-btn action-btn--cancel"
                                    title="Отмена"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditBot(bot)}
                                    className="action-btn action-btn--edit"
                                    title="Редактировать"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBotClick(bot.bot_guid)}
                                    className="action-btn action-btn--delete"
                                    title="Удалить бота"
                                    disabled={bots.length <= 1}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="settings-section__card" style={{ marginTop: '24px' }}>
              <h2 className="settings-section__card-title">Добавить нового бота</h2>
              <form onSubmit={handleAddBotSubmit} className="settings-form">
                <div className="form-group">
                  <label>Токен бота</label>
                  <input
                    type="text"
                    placeholder="Введите уникальный токен бота"
                    value={newBotForm.token}
                    onChange={(e) => setNewBotForm({ ...newBotForm, token: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Адрес хоста</label>
                    <input
                      type="text"
                      placeholder="localhost или IP"
                      value={newBotForm.adress}
                      onChange={(e) => setNewBotForm({ ...newBotForm, adress: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Порт</label>
                    <input
                      type="number"
                      placeholder="3004"
                      value={newBotForm.port}
                      onChange={(e) => setNewBotForm({ ...newBotForm, port: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">
                  <Plus size={16} />
                  <span>Добавить бота</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'blocked' && (
          <div className="settings-section">
            <div className="settings-section__card">
              <h2 className="settings-section__card-title">Список заблокированных пользователей</h2>
              
              {userError && <div className="settings-error"><AlertTriangle size={16} /> {userError}</div>}

              {blockedUsers.length === 0 ? (
                <div className="empty-state">
                  <UserCheck className="empty-state__icon" size={48} style={{ color: '#4aa5ae' }} />
                  <p className="empty-state__text">Черный список пуст. Все пользователи могут обращаться в поддержку.</p>
                </div>
              ) : (
                <div className="blocked-list">
                  {blockedUsers.map((user) => {
                    const bot = bots.find(b => b.bot_guid === user.botGuid);
                    return (
                      <div key={`${user.externalId};${user.botGuid}`} className="blocked-user-card">
                        <div className="blocked-user-card__info">
                          <span className="blocked-user-card__name">
                            {user.username || 'Без имени'}
                          </span>
                          <div className="blocked-user-card__details">
                            <span>ID: <strong>{user.externalId}</strong></span>
                            {user.phone && <span>• Тел: <strong>{user.phone}</strong></span>}
                            <span>• Бот: <strong title={bot?.token}>{bot?.token ? `${bot.token.substring(0, 8)}...` : 'Неизвестно'}</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblockUserClick(user.externalId, user.botGuid)}
                          className="unblock-btn"
                          title="Разблокировать пользователя"
                        >
                          <UserCheck size={16} />
                          <span>Разблокировать</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="settings-section__card" style={{ marginTop: '24px' }}>
              <h2 className="settings-section__card-title">Заблокировать нового пользователя</h2>
              <form onSubmit={handleBlockUserSubmit} className="settings-form">
                <div className="form-group-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>External ID пользователя</label>
                    <input
                      type="text"
                      placeholder="Введите внешний ID пользователя (например, max chat_id)"
                      value={newBlockForm.externalId}
                      onChange={(e) => setNewBlockForm({ ...newBlockForm, externalId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Привязанный Бот</label>
                    <select
                      value={newBlockForm.botGuid}
                      onChange={(e) => setNewBlockForm({ ...newBlockForm, botGuid: e.target.value })}
                      required
                      className="settings-select"
                    >
                      <option value="" disabled>Выберите бота...</option>
                      {bots.map((b) => (
                        <option key={b.bot_guid} value={b.bot_guid}>
                          {b.token.substring(0, 15)}... ({b.adress}:{b.port})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="submit-btn submit-btn--danger">
                  <UserX size={16} />
                  <span>Заблокировать пользователя</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
