import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizations1791172465268 implements MigrationInterface {
  name = 'CreateOrganizations1791172465268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`organizations\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(120) NOT NULL, \`plan\` varchar(20) NOT NULL DEFAULT 'free', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`organizations\``);
  }
}
