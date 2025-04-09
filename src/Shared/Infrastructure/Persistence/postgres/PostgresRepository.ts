/* eslint-disable @typescript-eslint/no-explicit-any */
import postgres, { Row } from "postgres";


import { PostgresConnection } from "./PostgresConnection";

export abstract class PostgresRepository {
	protected readonly connection: any;

	constructor() {
		this.connection = new PostgresConnection();
	}

	protected abstract toAggregate(row: Row): any;

	protected async searchOne(
		strings: TemplateStringsArray,
		...values: any[]
	): Promise<any | null> {
		const query = this.connection.sql(strings, ...values);
		const result = await query;

		return result.length ? this.toAggregate(result[0]) : null;
	}

	protected async searchMany(
		strings: TemplateStringsArray,
		...values: any[]
	): Promise<any[]> {
		
		const query = this.connection.sql(strings, ...values);
		const result = await query;

		return result.map((row) => this.toAggregate(row));
	}

	protected async execute(
		strings: TemplateStringsArray,
		...values: any[]
	): Promise<void> {
		await this.connection.sql(strings, ...values);
	}
}
