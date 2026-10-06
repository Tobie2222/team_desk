import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersMembershipsRefreshTokens1791269257855 implements MigrationInterface {
  name = 'CreateUsersMembershipsRefreshTokens1791269257855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`memberships\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`organization_id\` varchar(255) NOT NULL, \`role\` enum ('owner', 'admin', 'member', 'customer') NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_7c1e2fdfed4f6838e0c05ae505\` (\`user_id\`), INDEX \`IDX_e5380c394ec7912046d07b5429\` (\`organization_id\`), UNIQUE INDEX \`IDX_d43d9c8d18fcd49de0fa44bbd7\` (\`user_id\`, \`organization_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`refresh_tokens\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`expires_at\` datetime NOT NULL, \`revoked_at\` datetime NULL, \`replaced_by\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_3ddc983c5f7bcf132fd8732c3f\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_3ddc983c5f7bcf132fd8732c3f\` ON \`refresh_tokens\``,
    );
    await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_d43d9c8d18fcd49de0fa44bbd7\` ON \`memberships\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e5380c394ec7912046d07b5429\` ON \`memberships\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7c1e2fdfed4f6838e0c05ae505\` ON \`memberships\``,
    );
    await queryRunner.query(`DROP TABLE \`memberships\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
