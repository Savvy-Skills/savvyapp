import React, { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useModuleStore } from '../../store/moduleStore';
import ModuleCard from '../../components/ModuleCard';
import styles from '@/styles/styles';

export default function ModuleList() {
  const { modules, fetchModules } = useModuleStore();

  useEffect(() => {
    fetchModules();
  }, []);

  return (
    <FlatList
      data={modules}
      renderItem={({ item }) => <ModuleCard module={item} />}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
    />
  );
}
