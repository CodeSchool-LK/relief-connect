import { useState, useEffect } from 'react';
import Head from 'next/head';
import ItemList from '../components/ItemList';
import AddItemForm from '../components/AddItemForm';
import { itemService } from '../services';
import { ItemResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/item/response/item_response_dto';
import { ICreateItemRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [items, setItems] = useState<ItemResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await itemService.getAllItems();
      
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        setError(response.error || 'Failed to fetch items');
      }
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (name: string, description: string): Promise<void> => {
    try {
      const createItemDto: ICreateItemRequest = { name, description };
      const response = await itemService.createItem(createItemDto);
      
      if (response.success) {
        await fetchItems();
      } else {
        console.error('Failed to add item:', response.error);
      }
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>NX Monorepo Demo</title>
        <meta name="description" content="NX Monorepo with CI/CD" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>NX Monorepo</span>
        </h1>

        <p className={styles.description}>
          A modern monorepo setup with CI/CD for VPS deployment
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Add New Item</h2>
            <AddItemForm onAdd={handleAddItem} />
          </div>

          <div className={styles.card}>
            <h2>Items</h2>
            {loading && <p>Loading...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && <ItemList items={items} />}
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>🚀 NX Monorepo</h3>
            <p>Powerful build system and tooling</p>
          </div>
          <div className={styles.feature}>
            <h3>⚙️ CI/CD Ready</h3>
            <p>Automated deployments with GitHub Actions</p>
          </div>
          <div className={styles.feature}>
            <h3>🐳 Docker</h3>
            <p>Containerized for easy deployment</p>
          </div>
        </div>
      </main>
    </div>
  );
}
