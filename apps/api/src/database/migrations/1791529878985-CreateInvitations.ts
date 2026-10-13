import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvitations1791529878985 implements MigrationInterface {
  name = 'CreateInvitations1791529878985';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`invitations\` (\`id\` varchar(36) NOT NULL, \`organization_id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`role\` enum ('owner', 'admin', 'member', 'customer') NOT NULL, \`token_hash\` varchar(64) NOT NULL, \`expires_at\` datetime NOT NULL, \`accepted_at\` datetime NULL, \`invited_by\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_42d1dbb4d85dc3643fdc6560af\` (\`organization_id\`), UNIQUE INDEX \`IDX_872ac94a64b3d44fc4b554780c\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_872ac94a64b3d44fc4b554780c\` ON \`invitations\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_42d1dbb4d85dc3643fdc6560af\` ON \`invitations\``,
    );
    await queryRunner.query(`DROP TABLE \`invitations\``);
  }
}
