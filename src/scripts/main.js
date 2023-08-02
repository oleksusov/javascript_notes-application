'use strict';
import 'bulma';

import { months } from './months';
import { notes } from './notes';
import { archivedNotes } from './archivedNotes';

const table = document.querySelectorAll('.table')[0];
const summaryTable = document.querySelectorAll('.table')[1];
const addRowButton = document.querySelector('.add-row-button');
const popupBox = document.querySelector('.popup-box');
const title = popupBox.querySelector('.title');
const closeForm = popupBox.querySelector('.close-form');
const submitForm = popupBox.querySelector('.submit-form');
const nameInput = document.querySelector('input');
const categorySelect = document.querySelector('select');
const contentInput = document.querySelector('textarea');

let isUpdate = false;
let updateId = 0;

const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}/g;

function addRowToTable(rowData, index) {
  const newRow = table.insertRow(index);

  Object.keys(rowData).forEach((key) => {
    const cell = newRow.insertCell();

    cell.textContent = rowData[key];
  });

  const updateCell = newRow.insertCell();

  updateCell.appendChild(createButton('Update', 'update-btn', () => {
    handleUpdateButtonClick(newRow, newRow.rowIndex - 1);
  }));

  const archiveCell = newRow.insertCell();

  archiveCell.appendChild(createButton('Archive', 'archive-btn', () => {
    handleArchiveButtonClick(newRow, newRow.rowIndex - 1);
  }));

  const deleteCell = newRow.insertCell();

  deleteCell.appendChild(createButton('Delete', 'delete-btn', () => {
    handleDeleteButtonClick(newRow, newRow.rowIndex - 1);
  }));
}

function createButton(text, className, clickHandler) {
  const button = document.createElement('button');

  button.textContent = text;
  button.classList.add('button', className);
  button.addEventListener('click', clickHandler);

  return button;
}

function handleUpdateButtonClick(rowElement, noteId) {
  isUpdate = true;
  updateId = noteId;
  addRowButton.click();
  nameInput.value = notes[noteId].name;
  categorySelect.value = notes[noteId].category;
  contentInput.value = notes[noteId].content;
  submitForm.innerText = 'Update Note';
  title.innerText = 'Update Note';
  rowElement.remove();
}

function handleArchiveButtonClick(rowElement, noteId) {
  archivedNotes.push(...notes.splice(noteId, 1));
  rowElement.remove();
  createSummaryTable(notes, archivedNotes);
}

function handleDeleteButtonClick(rowElement, noteId) {
  notes.splice(noteId, 1);
  rowElement.remove();
  createSummaryTable(notes, archivedNotes);
}

addRowButton.addEventListener('click', () => {
  popupBox.classList.add('is-showed');
});

closeForm.addEventListener('click', () => {
  isUpdate = false;
  popupBox.classList.remove('is-showed');
  submitForm.innerText = 'Add Note';
  title.innerText = 'Add new Note';
  nameInput.value = '';
  categorySelect.selectedIndex = 0;
  contentInput.value = '';
});

submitForm.addEventListener('click', (event) => {
  event.preventDefault();

  const noteName = nameInput.value.trim();
  const noteContent = contentInput.value.trim();
  const noteCategory = categorySelect
    .options[categorySelect.selectedIndex].value;

  try {
    if (noteName === '') {
      throw new Error('Name is required.');
    }

    if (categorySelect.selectedIndex === 0) {
      throw new Error('Category must be selected.');
    }

    if (noteContent === '') {
      throw new Error('Content is required.');
    }

    if (noteName && noteContent && noteCategory) {
      clearErrorClasses();

      const dateObject = new Date();
      const year = dateObject.getFullYear();
      const month = months[dateObject.getMonth()];
      const day = dateObject.getDate();
      const dates = noteContent.match(dateRegex);

      const noteInfo = {
        name: noteName,
        category: noteCategory,
        created: `${month} ${day}, ${year}`,
        content: noteContent,
        dates: dates || '',
      };

      if (!isUpdate) {
        notes.push(noteInfo);
        addRowToTable(noteInfo, -1);
      } else {
        isUpdate = false;
        notes[updateId] = noteInfo;
        addRowToTable(noteInfo, updateId + 1);
      }

      createSummaryTable(notes, archivedNotes);
      closeForm.click();
    }
  } catch (error) {
    addErrorClass();
  }
});

function addErrorClass(error) {
  if (!nameInput.value.trim()) {
    nameInput.classList.add('is-danger');
  }

  if (categorySelect.selectedIndex === 0) {
    document.querySelector('.select').classList.add('is-danger');
  }

  if (!contentInput.value.trim()) {
    contentInput.classList.add('is-danger');
  }
}

function clearErrorClasses() {
  nameInput.classList.remove('is-danger');
  document.querySelector('.select').classList.remove('is-danger');
  contentInput.classList.remove('is-danger');
}

function createSummaryTable(actives, archived) {
  const categories = ['Task', 'Random Thought', 'Idea'];
  const tbody = summaryTable.getElementsByTagName('tbody')[0];

  tbody.innerHTML = '';

  categories.forEach((category) => {
    const newRow = tbody.insertRow();
    const categoryCell = newRow.insertCell();

    categoryCell.textContent = category;

    const activeCountCell = newRow.insertCell();
    const activeCount = actives
      .filter((note) => note.category === category).length;

    activeCountCell.textContent = activeCount;

    const archivedCountCell = newRow.insertCell();
    const archivedCount = archived
      .filter((note) => note.category === category).length;

    archivedCountCell.textContent = archivedCount;
  });
}

function initializeTables() {
  notes.forEach((rowData) => {
    addRowToTable(rowData);
  });
  createSummaryTable(notes, archivedNotes);
}

initializeTables();
