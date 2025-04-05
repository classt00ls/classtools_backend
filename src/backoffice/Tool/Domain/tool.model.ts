import { BaseModel } from "@Shared/Domain/Model/base.model";
import { TagModel } from "@backoffice/Tag/Domain/Tag.model";

export type ToolStatus = 'pending' | 'published' //  TODO: add more status

export class ToolModel extends BaseModel {

  // El estado de la tool changing | pending | published AND more??

  deleted: boolean;

  uploaded: boolean;

  status: ToolStatus = 'published';

  private constructor(
		public readonly id: string,
		public name: string,
		public pricing: string,
		public stars: number,
		public description: string,
		public features: string,
    public excerpt: string,
    public tags: TagModel[],
    public link: string,
    public url: string,
    public html: string,
    public video_html: string,
    public video_url: string,
    public prosAndCons: string,
    public ratings: string,
    public howToUse: string,
    public reviews_content: string = ''
    ){
      
		super();
    
    this.deleted = false;
    this.uploaded = true;
	}

  addTags(tags: TagModel[]) {
    for (const tag of tags) {
      if (!(tag instanceof TagModel)) {
        throw new Error('Invalid tag provided. Only Tag instances allowed.');
      }
    }

    // Añadir tags a la lista
    for (const tag of tags) {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    }
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      excerpt: this.excerpt,
      url: this.url,
      stars: this.stars,
      description: this.description,
      features: this.features,
      pricing: this.pricing,
      tags: this.getTagsPrimitives(),
      video_url: this.video_url,
      prosAndCons: this.prosAndCons,
      ratings: this.ratings,
      howToUse: this.howToUse
    }
  }

  static fromPrimitives(
    id: string,
		name: string,
		pricing: string,
		stars: number,
		description: string,
		features: string,
    excerpt: string,
    tags: TagModel[],
    link: string,
    url: string,
    html: string,
    video_html: string,
    video_url: string,
    prosAndCons: string,
    ratings: string = '',
    howToUse: string = '',
    reviews_content: string = ''
  ) {
    return new ToolModel(
      id,
      name,
      pricing,
      stars,
      description,
      features,
      excerpt,
      tags,
      link,
      url,
      html,
      video_html,
      video_url,
      prosAndCons,
      ratings,
      howToUse,
      reviews_content
    )
  }

  getTagsPrimitives() {
    return this.tags.map(tag => tag.toPrimitives());
  }

  getTagsPrimitivesAsString(): string {
    return this.tags
      .map(tag => Object.values(tag.toPrimitives()).join(', '))
      .join(', ');
  }
}