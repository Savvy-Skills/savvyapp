import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Menu,
  TextInput,
  Text,
  Icon,
  IconButton,
} from "react-native-paper";
import { useFilters } from "../hooks/useFilters";
import type { FilterProps } from "../types/filter";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { Colors } from "@/constants/Colors";
import styles from "@/styles/styles";
import { generateColors } from "@/utils/utilfunctions";

function SingleFilterRow({
  filter,
  fields,
  disabled = false,
  showAddButton = false,
  showConcatenator = false,
  onAddClick,
  setConcatenationType,
  concatenationType,
}: any) {
  const {
    selectedField,
    setSelectedField,
    selectedOperator,
    setSelectedOperator,
    filterValue,
    setFilterValue,
    operators,
    shouldShowInput,
  } = filter;

  const [fieldMenuVisible, setFieldMenuVisible] = React.useState(false);
  const [operatorMenuVisible, setOperatorMenuVisible] = React.useState(false);
  const [valueMenuVisible, setValueMenuVisible] = React.useState(false);
  const [concatMenuVisible, setConcatMenuVisible] = React.useState(false);

  return (
    <View style={localStyles.filterRowContainer}>
      <View style={localStyles.filterRow}>
        <Menu
          visible={fieldMenuVisible}
          onDismiss={() => setFieldMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFieldMenuVisible(true)}
              style={[
                localStyles.button,
                localStyles.fieldButton,
                !selectedField
                  ? disabled
                    ? localStyles.disabled
                    : localStyles.callToAction
                  : localStyles.hasValue,
              ]}
              labelStyle={[
                !selectedField
                  ? disabled
                    ? localStyles.disabled
                    : localStyles.callToActionLabel
                  : localStyles.hasValueLabel,
              ]}
              disabled={disabled}
            >
              {selectedField?.name || "Select field"}
            </Button>
          }
        >
          {fields.map((field: any) => (
            <Menu.Item
              key={field.name}
              onPress={() => {
                setSelectedField(field);
                setFieldMenuVisible(false);
              }}
              title={field.name}
            />
          ))}
        </Menu>

        <Menu
          visible={operatorMenuVisible}
          onDismiss={() => setOperatorMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setOperatorMenuVisible(true)}
              style={[
                localStyles.button,
                localStyles.operatorButton,
                !selectedField || disabled ? localStyles.disabled : localStyles.hasValue,
              ]}
              disabled={!selectedField || disabled}
              labelStyle={
                !selectedField || disabled ? {} : localStyles.hasValueLabel
              }
            >
              {selectedOperator}
            </Button>
          }
        >
          {operators.map((op: any) => (
            <Menu.Item
              key={op}
              onPress={() => {
                setSelectedOperator(op);
                setOperatorMenuVisible(false);
              }}
              title={op}
            />
          ))}
        </Menu>

        {shouldShowInput ? (
          <TextInput
            value={filterValue}
            mode="outlined"
            onChangeText={setFilterValue}
            style={[
              localStyles.input,
              disabled || !selectedField
                ? localStyles.disabled
                : filterValue
                ? localStyles.hasValue
                : localStyles.callToAction,
            ]}
            outlineColor={
              disabled || !filterValue
                ? "rgb(255, 152, 0)"
                : "rgb(33, 150, 243)"
            }
            activeOutlineColor={
              disabled || !filterValue
                ? "rgb(255, 152, 0)"
                : "rgb(33, 150, 243)"
            }
            placeholder="Enter value"
            keyboardType={
              selectedField?.type === "numeric" ? "numeric" : "default"
            }
            disabled={!selectedField || disabled}
          />
        ) : (
          <Menu
            visible={valueMenuVisible}
            onDismiss={() => setValueMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setValueMenuVisible(true)}
                style={[
                  localStyles.button,
                  localStyles.valueButton,
                  filterValue
                    ? localStyles.hasValue
                    : disabled || !selectedField
                    ? localStyles.disabled
                    : localStyles.callToAction,
                ]}
                disabled={!selectedField || disabled}
              >
                {filterValue || "Select value"}
              </Button>
            }
          >
            {selectedField?.uniqueValues?.map((value: any) => (
              <Menu.Item
                key={value}
                onPress={() => {
                  setFilterValue(value);
                  setValueMenuVisible(false);
                }}
                title={value}
              />
            ))}
          </Menu>
        )}
      </View>
      {showAddButton && (
        <IconButton
          icon="plus"
          size={20}
          onPress={onAddClick}
          style={localStyles.addFilterButton}
        />
      )}
      {showConcatenator && (
        <Menu
          visible={concatMenuVisible}
          onDismiss={() => setConcatMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setConcatMenuVisible(true)}
              style={[localStyles.button, localStyles.concatButton, localStyles.hasValue]}
              labelStyle={localStyles.hasValueLabel}
            >
              {concatenationType}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setConcatenationType("AND");
              setConcatMenuVisible(false);
            }}
            title="AND"
          />
          <Menu.Item
            onPress={() => {
              setConcatenationType("OR");
              setConcatMenuVisible(false);
            }}
            title="OR"
          />
        </Menu>
      )}
    </View>
  );
}

export default function Filter({
  fields,
  onFilterChange,
  disabled = false,
}: FilterProps) {
  const {
    firstFilter,
    secondFilter,
    concatenationType,
    setConcatenationType,
    isFirstFilterComplete,
    currentCombinedFilter,
    resetFilters,
    showSecondFilter,
    setShowSecondFilter,
  } = useFilters();

  React.useEffect(() => {
    onFilterChange(currentCombinedFilter);
  }, [currentCombinedFilter, onFilterChange]);

  return (
    <View style={[styles.slideWidth, styles.centeredMaxWidth]}>
      <View style={localStyles.titleContainer}>
        <Icon source="cog" size={24} />
        <Text style={localStyles.title}>Filters</Text>
        {currentCombinedFilter && (
          <IconButton
            icon="trash-can"
            size={20}
            onPress={resetFilters}
            style={localStyles.clearButton}
            iconColor="red"
          />
        )}
      </View>

      <SingleFilterRow
        filter={firstFilter}
        fields={fields}
        disabled={disabled}
        showAddButton={isFirstFilterComplete && !showSecondFilter}
        onAddClick={() => setShowSecondFilter(true)}
        setConcatenationType={setConcatenationType}
        concatenationType={concatenationType}
        showConcatenator={isFirstFilterComplete && showSecondFilter}
      />

      {isFirstFilterComplete && showSecondFilter && (
        <>
          <SingleFilterRow
            filter={secondFilter}
            fields={fields}
            disabled={disabled}
          />
        </>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    gap: 8,
    padding: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    flex: 1,
  },
  clearButton: {
    margin: 0,
  },
  filterRowContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  addFilterButton: {
    margin: 0,
  },
  button: {
    borderRadius: 5,
    justifyContent: "space-between",
  },
  fieldButton: {
    flex: 2,
  },
  operatorButton: {
    flex: 1,
  },
  valueButton: {
    flex: 2,
  },
  concatButton: {
    minWidth: 80,
    alignSelf: "flex-start",
  },
  input: {
    flex: 2,
    height: 40,
    justifyContent: "center",
  },
  callToAction: {
	backgroundColor: generateColors(Colors.orange, 0.2).muted,
    borderColor: Colors.orange,
	color: Colors.orange,
  },
  callToActionLabel: {
    color: Colors.orange,
  },
  hasValue: {
	backgroundColor: generateColors(Colors.blue, 0.2).muted,
	borderColor: Colors.blue,
  },
  hasValueLabel: {
	color: Colors.blue,
  },
  disabled: {
	backgroundColor: generateColors(Colors.text, 0.1).muted,
  },
});
