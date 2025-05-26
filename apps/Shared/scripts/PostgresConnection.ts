import * as postgres from 'postgres';

export class PostgresConnection {
	public readonly sql: postgres.Sql;

	constructor(
		host: string = process.env.DB_HOST || 'localghost',
		port: number = parseInt(process.env.DB_PORT || '5432', 10),
		user: string = process.env.DB_USER || 'classtools',
		password: string = process.env.DB_PASSWORD || 'classtools',
		database: string = process.env.DB_NAME || 'classtools',
		ssl: boolean = process.env.DB_SSL === 'true',
	) {
		this.sql = postgres({
			host,
			port,
			user,
			password,
			database,
			ssl: ssl ? { rejectUnauthorized: false } : false,
			onnotice: () => {},
		});
	}

	async end(): Promise<void> {
		await this.sql.end();
	}

	async truncateAll(): Promise<void> {
		await this.sql`DO
$$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename
              FROM pg_tables
              WHERE schemaname IN ('shop', 'shared', 'product'))
    LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END
$$;`;
	}
}
