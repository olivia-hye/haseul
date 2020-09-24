export class ShopItem {
  id: number;
  keyword: string;
  title: string;
  price: number;
  active: boolean;
  credit: string;
  imageDataId: number;
  flavorText: string;

  constructor(data: {
    id: number;
    keyword: string;
    title: string;
    price: number;
    active: boolean;
    credit: string;
    image_data_id: number;
    flavor_text: string;
  }) {
    this.id = data.id;
    this.keyword = data.keyword;
    this.title = data.title;
    this.price = data.price;
    this.active = data.active;
    this.credit = data.credit;
    this.imageDataId = data.image_data_id;
    this.flavorText = data.flavor_text;
  }
}
