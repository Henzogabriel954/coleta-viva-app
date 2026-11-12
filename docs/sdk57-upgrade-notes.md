# Expo SDK 57 — notas de atualização

## Fontes oficiais

1. Expo SDK 57 changelog: https://expo.dev/changelog/sdk-57
2. Guia oficial de upgrade: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
3. Expo Go: https://expo.dev/go

## Pontos relevantes

O SDK 57 atualiza o React Native de 0.85 para 0.86 e usa React 19.2. Para reduzir regressões de memória e de inicialização em desenvolvimento, a documentação recomenda usar `expo@57.0.17` ou superior; a versão `57.0.17` atualiza o React Native para 0.86.3.

O procedimento oficial é instalar `expo@^57.0.0`, executar `npx expo install --fix` para alinhar as dependências e depois executar `npx expo-doctor`. A página oficial do Expo Go indica o SDK 57 como a versão mais recente.

Como o projeto atual estava no SDK 54, a atualização deve alinhar também os módulos Expo, React Native, React DOM e bibliotecas nativas relacionadas, especialmente `expo-router`, `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler`, `expo-image-picker`, `expo-location` e `react-native-maps`.
