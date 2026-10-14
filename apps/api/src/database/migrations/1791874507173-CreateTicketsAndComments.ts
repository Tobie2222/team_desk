import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketsAndComments1791874507173 implements MigrationInterface {
  name = 'CreateTicketsAndComments1791874507173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tickets\` (\`id\` varchar(36) NOT NULL, \`organization_id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`status\` enum ('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open', \`priority\` enum ('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium', \`requester_id\` varchar(36) NOT NULL, \`assignee_id\` varchar(36) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, INDEX \`IDX_2878e19e944b55cf5db3d71a58\` (\`organization_id\`, \`requester_id\`), INDEX \`IDX_97d85aaf7f32c732a1855069c1\` (\`organization_id\`, \`status\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ticket_comments\` (\`id\` varchar(36) NOT NULL, \`ticket_id\` varchar(36) NOT NULL, \`organization_id\` varchar(36) NOT NULL, \`author_id\` varchar(36) NOT NULL, \`body\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_22baabb9dc523ca7af9cf7764a\` (\`organization_id\`, \`ticket_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_22baabb9dc523ca7af9cf7764a\` ON \`ticket_comments\``,
    );
    await queryRunner.query(`DROP TABLE \`ticket_comments\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97d85aaf7f32c732a1855069c1\` ON \`tickets\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_2878e19e944b55cf5db3d71a58\` ON \`tickets\``,
    );
    await queryRunner.query(`DROP TABLE \`tickets\``);
  }
}
