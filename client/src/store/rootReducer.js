import { combineReducers } from '@reduxjs/toolkit';
import { reducer as calendarReducer } from 'src/slices/calendar';
import { reducer as chatReducer } from 'src/slices/chat';
import { reducer as formReducer } from 'redux-form';
import { reducer as kanbanReducer } from 'src/slices/kanban';
import { reducer as mailReducer } from 'src/slices/mail';
import { reducer as notificationReducer } from 'src/slices/notification';
import { reducer as selectedCompanyReducer } from 'src/slices/selectedCompany';
import { reducer as sidebarReducer } from 'src/slices/search';
import { reducer as OptionsReducer } from 'src/slices/Options';
import { reducer as interlinksReducer } from 'src/slices/interLinks';

const rootReducer = combineReducers({
  calendar: calendarReducer,
  chat: chatReducer,
  form: formReducer,
  kanban: kanbanReducer,
  mail: mailReducer,
  interlinks: interlinksReducer,
  notifications: notificationReducer,
  selectedCompany: selectedCompanyReducer,
  sidebar: sidebarReducer,
  Options: OptionsReducer
});

export default rootReducer;
