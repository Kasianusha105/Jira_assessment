import { Component, OnInit } from '@angular/core';
interface Card {
  title: string;
  description: string;
  createdAt: Date | undefined;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  lists = [
    { title: 'Todo', cards: [] as Card[] },
    { title: 'In Progress', cards: [] as Card[] },
    { title: 'Etc', cards: [] as Card[] }
  ];
  draggedCard: any = null;
  sourceListIndex: number = -1;
  showAddCardDialog = false;

  selectedListIndex: number | null = null;


  showAddListDialog = false;

   newList = {title: ''};

  showDialog = false;
  newCard: Card = { title: '', description: '',   createdAt: undefined
};


ngOnInit(): void {
  const savedLists = localStorage.getItem('kanbanlists');
  if (savedLists) {
    this.lists = JSON.parse(savedLists);

  } else {
    this.lists = [
      { title: 'Todo', cards: [] },
      { title: 'In Progress', cards: [] },
      { title: 'Completed', cards: [] }
    ];
  }

  this.saveData();
}

  openAddCardDialog(index: number) {
    this.selectedListIndex = index;
    this.showAddCardDialog = true;
    this.newCard = {
      title: '',
      description: '',
      createdAt: new Date()
    };
  }

  openAddListDialog() {
    this.newList = { title: '' };
    this.showAddListDialog = true;
  }


  closeDialog() {
    this.showDialog = false;
  }

  addCard() {
    if (this.selectedListIndex !== null) {
      const list = this.lists[this.selectedListIndex];
      list.cards.push({
        title: this.newCard.title,
        description: this.newCard.description,
        createdAt: new Date()
      });

      // Sort cards in reverse chronological order
      list.cards.sort((a, b) => new Date(b.createdAt?? new Date()).getTime() - new Date(a.createdAt?? new Date ()).getTime());

      this.saveData();
      this.showAddCardDialog = false;
      this.newCard = { title: '', description: '', createdAt: new Date() };
      this.selectedListIndex = null;
    }
  }

  addList() {
    if (this.newList.title.trim()) {
      this.lists.push({ title: this.newList.title.trim(), cards: [] });
      this.saveData();
    }

    this.newList = { title: '' };
    this.showAddListDialog = false;
  }


  clearList(index: number) {
    this.lists.splice(index, 1);
    this.saveData();
  }

  deleteCard(listIndex: number, cardIndex: number) {
    this.lists[listIndex].cards.splice(cardIndex, 1);
    this.saveData();
  }


  saveData() {
    localStorage.setItem('kanbanlists', JSON.stringify(this.lists));
  }

  onDragStart(event: DragEvent, card: Card, listIndex: number) {
    this.draggedCard = card;
    this.sourceListIndex = listIndex;
    event.dataTransfer?.setData('text/plain', '');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Required to allow drop
  }

  onDrop(event: DragEvent, targetListIndex: number) {
    event.preventDefault();

    if (this.sourceListIndex === -1 || !this.draggedCard) return;

    // Remove from original list
    const cardIndex = this.lists[this.sourceListIndex].cards.indexOf(this.draggedCard);
    if (cardIndex > -1) {
      this.lists[this.sourceListIndex].cards.splice(cardIndex, 1);
    }

    // Add to target list
    this.lists[targetListIndex].cards.push({ ...this.draggedCard });

    // Sort by reverse chronological order
    this.lists[targetListIndex].cards.sort(
      (a: Card, b: Card) => new Date(b.createdAt ?? new Date()).getTime() - new Date(a.createdAt ?? new Date()).getTime()
    );

    // Clear state
    this.draggedCard = null;
    this.sourceListIndex = -1;

    this.saveData();
  }
}
