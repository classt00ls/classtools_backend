export class ScrapToolResponse {
    
    constructor(
    public readonly title: string,
    public readonly pricing: string,
    public readonly stars: number,
    public readonly tags: string[],
    public readonly link: string,
    public readonly url: string,
    public readonly body_content: string,
    public readonly video_content: string
    ){}
}