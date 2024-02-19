use axum::async_trait;
use lib_shared_site_api::db::{db_error::DbError, util::append_comma};
use lib_shared_types::{
    dto::site_api::{
        create_metadata_dto::CreateSiteMetadataDto, update_metadata_dto::UpdateSiteMetadataDto,
    },
    entity::site_api::site_metadata_entity::SiteMetadataEntity,
};
use sqlx::{sqlite::SqliteRow, Error, QueryBuilder, Row, Sqlite, SqlitePool, Transaction};
use std::sync::Arc;

pub type DynSitesMetadataRepo = Arc<dyn SitesMetadataRepoTrait + Send + Sync>;

#[async_trait]
pub trait SitesMetadataRepoTrait {
    fn get_db_pool(&self) -> &SqlitePool;
    async fn start_transaction(&self) -> Result<Transaction<'_, Sqlite>, Error>;
    async fn get_site_metadata(&self, site_id: &str) -> Result<SiteMetadataEntity, Error>;
    async fn create_site(&self, dto: CreateSiteMetadataDto) -> Result<String, Error>;
    async fn update_site_metadata(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        id: &str,
        dto: &UpdateSiteMetadataDto,
    ) -> Result<(), DbError>;
    async fn list_sites(&self) -> Result<Vec<SiteMetadataEntity>, Error>;
    async fn delete_site(&self, id: &str) -> Result<(), Error>;
    async fn set_site_domains(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        id: &str,
        domains: &Vec<String>,
    ) -> Result<(), Error>;
    async fn get_site_id_by_hostname(&self, hostname: &str) -> Result<String, Error>;
    async fn reset(&self) -> Result<(), Error>;
}

pub struct SitesMetadataRepo {
    pub metadata_db_pool: SqlitePool,
}

fn row_to_site_metadata(row: SqliteRow) -> Result<SiteMetadataEntity, Error> {
    let domains: String = row.try_get("domains")?;
    Ok(SiteMetadataEntity {
        id: row.try_get("id")?,
        location: row.try_get("location")?,
        owner_id: row.try_get("owner_id")?,
        domains: domains.split(",").map(|d| d.to_string()).collect(),
        site_type: row.try_get("site_type")?,
        disabled: row.try_get("disabled")?,
    })
}

#[async_trait]
impl SitesMetadataRepoTrait for SitesMetadataRepo {
    fn get_db_pool(&self) -> &SqlitePool {
        return &self.metadata_db_pool;
    }

    async fn start_transaction(&self) -> Result<Transaction<'_, Sqlite>, Error> {
        let transaction = self.get_db_pool().begin().await?;
        Ok(transaction)
    }

    async fn get_site_metadata(&self, site_id: &str) -> Result<SiteMetadataEntity, Error> {
        let site: SiteMetadataEntity = sqlx::query(
            r#"
        SELECT s.id, s.location, s.owner_id, s.site_type, s.disabled, GROUP_CONCAT(d.domain) as domains
        FROM sites s
        LEFT OUTER JOIN domains d ON d.site_id = s.id
        WHERE s.id = ?1
    "#,
        )
        .bind(site_id)
        .try_map(row_to_site_metadata)
        .fetch_one(self.get_db_pool())
        .await?;
        Ok(site)
    }

    async fn list_sites(&self) -> Result<Vec<SiteMetadataEntity>, Error> {
        let sites: Vec<SiteMetadataEntity> = sqlx::query(
            r#"
        SELECT s.id, s.location, s.owner_id, s.site_type, s.disabled, GROUP_CONCAT(d.domain) as domains
        FROM sites s
        LEFT OUTER JOIN domains d ON d.site_id = s.id
        GROUP BY d.site_id
    "#,
        )
        .try_map(row_to_site_metadata)
        .fetch_all(self.get_db_pool())
        .await?;
        Ok(sites)
    }

    async fn create_site(&self, dto: CreateSiteMetadataDto) -> Result<String, Error> {
        let id = dto.site_id;
        let base_path = "site-api/db/sites";
        let db_location = format!("{}/site_{}.db", base_path, id);

        let site_id = sqlx::query_scalar(
            r#"
          INSERT INTO sites(id, location, owner_id, site_type)
          VALUES (?1, ?2, ?3, ?4)
          RETURNING id
        "#,
        )
        .bind(&id)
        .bind(db_location)
        .bind(dto.owner_id)
        .bind(dto.site_type.to_string())
        .fetch_one(self.get_db_pool())
        .await?;

        // Start an sqlx transaction
        let mut tx = self.start_transaction().await?;

        // Create domain entries
        self.set_site_domains(&mut tx, &id, &dto.domains).await?;

        // Commit the transaction
        tx.commit().await?;

        Ok(site_id)
    }

    async fn update_site_metadata(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        id: &str,
        dto: &UpdateSiteMetadataDto,
    ) -> Result<(), DbError> {
        let query = QueryBuilder::new("UPDATE sites SET");
        let count = 0;

        let (query, count) = append_comma(query, "site_type", dto.site_type, count);
        let (mut query, count) = append_comma(query, "disabled", dto.disabled, count);

        if count == 0 {
            return Ok(());
        }

        query.push(" WHERE id = ");
        query.push_bind(id);
        query
            .build()
            .execute(tx)
            .await
            .map_err(|e| DbError::Query(e.to_string()))?;
        Ok(())
    }

    async fn delete_site(&self, id: &str) -> Result<(), Error> {
        sqlx::query(
            r#"
            DELETE FROM sites WHERE id = ?
        "#,
        )
        .bind(id)
        .execute(self.get_db_pool())
        .await?;

        Ok(())
    }

    async fn set_site_domains(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        id: &str,
        domains: &Vec<String>,
    ) -> Result<(), Error> {
        sqlx::query(
            r#"
            DELETE FROM domains WHERE site_id = ?
        "#,
        )
        .bind(id)
        .execute(&mut *tx)
        .await?;

        let mut query: QueryBuilder<'_, Sqlite> =
            QueryBuilder::new("INSERT INTO domains ( domain, site_id )  VALUES ");
        let mut domain_it = domains.iter().peekable();
        while let Some(domain) = domain_it.next() {
            query.push("(");
            query.push_bind(domain);
            query.push(", ");
            query.push_bind(id);
            if domain_it.peek().is_none() {
                query.push(")");
            } else {
                query.push("),");
            }
        }
        query.build().execute(&mut *tx).await?;

        Ok(())
    }

    async fn get_site_id_by_hostname(&self, hostname: &str) -> Result<String, Error> {
        let result: (String,) = sqlx::query_as(
            r#"
            SELECT site_id FROM domains WHERE domain = ?
        "#,
        )
        .bind(hostname)
        .fetch_one(self.get_db_pool())
        .await?;

        let (id,) = result;
        Ok(id)
    }

    async fn reset(&self) -> Result<(), Error> {
        let tables = vec!["_sqlx_migrations", "backups", "domains", "sites"];

        for table in tables.iter() {
            sqlx::query(&format!(r#"DROP TABLE {}"#, table))
                .execute(self.get_db_pool())
                .await?;
        }

        sqlx::migrate!("./db/metadata/migrations")
            .run(self.get_db_pool())
            .await?;

        Ok(())
    }
}
