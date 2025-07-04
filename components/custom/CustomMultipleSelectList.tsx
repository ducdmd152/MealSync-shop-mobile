import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  ViewStyle,
  TextStyle,
  Keyboard,
  Pressable,
} from "react-native";

interface CustomMultipleSelectListProps {
  setSelected: (val: any) => void;
  selected: any[];
  placeholder?: string;
  boxStyles?: ViewStyle;
  inputStyles?: TextStyle;
  dropdownStyles?: ViewStyle;
  dropdownItemStyles?: ViewStyle;
  dropdownTextStyles?: TextStyle;
  maxHeight?: number;
  data: Array<{ key?: any; value?: any; disabled?: boolean }>;
  defaultOption?: { key: any; value: any };
  searchicon?: JSX.Element;
  arrowicon?: JSX.Element;
  search?: boolean;
  searchPlaceholder?: string;
  onSelect?: () => void;
  selectedText?: string;
  label?: string;
  fontFamily?: string;
  notFoundText?: string;
  disabledItemStyles?: ViewStyle;
  disabledTextStyles?: TextStyle;
  disabledCheckBoxStyles?: ViewStyle;
  checkBoxStyles?: ViewStyle;
  save?: "key" | "value";
  dropdownShown?: boolean;
  closeicon?: JSX.Element;
  badgeStyles?: ViewStyle;
  badgeTextStyles?: TextStyle;
  labelStyles?: TextStyle;
  defaultOptions?: any[];
}
type L1Keys = { key?: any; value?: any; disabled?: boolean | undefined };

const CustomMultipleSelectList: React.FC<CustomMultipleSelectListProps> = ({
  selectedText = "Selected text",
  fontFamily,
  setSelected,
  selected,
  placeholder,
  boxStyles,
  inputStyles,
  dropdownStyles,
  dropdownItemStyles,
  dropdownTextStyles,
  maxHeight,
  data,
  defaultOptions,
  searchicon = false,
  arrowicon = false,
  closeicon = false,
  search = true,
  searchPlaceholder = "search",
  onSelect = () => {},
  label,
  notFoundText = "No data found",
  disabledItemStyles,
  disabledTextStyles,
  disabledCheckBoxStyles,
  labelStyles,
  badgeStyles,
  badgeTextStyles,
  checkBoxStyles,
  save = "key",
  dropdownShown = false,
}) => {
  const oldOption = React.useRef(null);
  const [_firstRender, _setFirstRender] = React.useState<boolean>(true);
  const [_defaultOptionsDefined, _setDefaultOptionsDefined] =
    React.useState<boolean>(false);
  const [dropdown, setDropdown] = React.useState<boolean>(dropdownShown);
  const [selectedval, setSelectedVal] = React.useState<any>([]);
  const [height, setHeight] = React.useState<number>(350);
  const animatedvalue = React.useRef(new Animated.Value(0)).current;
  const [filtereddata, setFilteredData] = React.useState(data);
  const [searchValue, setSearchValue] = React.useState("");

  const slidedown = () => {
    setDropdown(true);

    Animated.timing(animatedvalue, {
      toValue: height,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };
  const slideup = () => {
    Animated.timing(animatedvalue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start(() => setDropdown(false));
  };

  React.useEffect(() => {
    if (maxHeight) setHeight(maxHeight);
  }, [maxHeight]);

  React.useEffect(() => {
    setFilteredData(data);
  }, [data]);

  React.useEffect(() => {
    if (_firstRender) {
      _setFirstRender(false);
      return;
    }
    onSelect();
  }, [selectedval]);

  React.useEffect(() => {
    if (defaultOptions && !_defaultOptionsDefined) {
      _setDefaultOptionsDefined(true);
      setSelected(
        defaultOptions.map((item) =>
          save === "key" ? item?.key : item?.value,
        ),
      );
      // setSelectedVal(defaultOptions.map((item) => item?.value));
    }
  });
  useEffect(() => {
    setSelectedVal(
      data
        .filter((item) => selected.includes(item.key))
        .map((item) => item?.value),
    );
  }, [selected]);

  React.useEffect(() => {
    if (!_firstRender) {
      if (dropdownShown) slidedown();
      else slideup();
    }
  }, [dropdownShown]);

  return (
    <View>
      {dropdown && search ? (
        <View style={[styles.wrapper, boxStyles]}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {!searchicon ? (
              <Image
                source={require("../../assets/images/search.png")}
                resizeMode="contain"
                style={{ width: 20, height: 20, marginRight: 7 }}
              />
            ) : (
              searchicon
            )}

            <TextInput
              placeholder={searchPlaceholder}
              placeholderTextColor="#888"
              onChangeText={(val) => {
                let result = data.filter((item: L1Keys) => {
                  val.toLowerCase();
                  let row = item.value.toLowerCase();
                  return row.search(val.toLowerCase()) > -1;
                });
                setFilteredData(result);
                setSearchValue(val);
              }}
              value={searchValue}
              style={[
                { padding: 0, height: 20, flex: 1, fontFamily },
                inputStyles,
              ]}
            />
            <TouchableOpacity
              onPress={() => {
                slideup();
                // setTimeout(() => setFilteredData(data), 800)
              }}
            >
              {!closeicon ? (
                <Image
                  source={require("../../assets/images/close.png")}
                  resizeMode="contain"
                  style={{ width: 17, height: 17 }}
                />
              ) : (
                closeicon
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : selectedval?.length > 0 ? (
        <TouchableOpacity
          style={[styles.wrapper, boxStyles]}
          onPress={() => {
            if (!dropdown) {
              Keyboard.dismiss();
              slidedown();
            } else {
              slideup();
            }
          }}
        >
          <View>
            <Text style={[{ fontWeight: "600", fontFamily }, labelStyles]}>
              {label}
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              {selectedval?.map((item: any, index: number) => {
                return (
                  <View
                    key={index}
                    style={[
                      {
                        backgroundColor: "gray",
                        paddingHorizontal: 20,
                        paddingVertical: 5,
                        borderRadius: 50,
                        marginRight: 10,
                        marginTop: 10,
                      },
                      badgeStyles,
                    ]}
                  >
                    <Text
                      style={[
                        { color: "white", fontSize: 12, fontFamily },
                        badgeTextStyles,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.wrapper, boxStyles]}
          onPress={() => {
            if (!dropdown) {
              Keyboard.dismiss();
              slidedown();
            } else {
              slideup();
            }
          }}
        >
          <Text style={[{ fontFamily }, inputStyles]}>
            {selectedval == ""
              ? placeholder
                ? placeholder
                : "Select option"
              : selectedval}
          </Text>
          {!arrowicon ? (
            <Image
              source={require("../../assets/images/chevron.png")}
              resizeMode="contain"
              style={{ width: 20, height: 20 }}
            />
          ) : (
            arrowicon
          )}
        </TouchableOpacity>
      )}

      {dropdown ? (
        <Animated.View
          style={[
            { maxHeight: animatedvalue },
            styles.dropdown,
            dropdownStyles,
          ]}
        >
          <View style={[{ maxHeight: height }]}>
            <ScrollView
              contentContainerStyle={{ paddingVertical: 10 }}
              nestedScrollEnabled={true}
            >
              {filtereddata.length >= 1 ? (
                filtereddata.map((item: L1Keys, index: number) => {
                  let key = item.key ?? item.value ?? item;
                  let value = item.value ?? item;
                  let disabled = item.disabled ?? false;
                  if (disabled) {
                    return (
                      <TouchableOpacity
                        style={[styles.disabledoption, disabledItemStyles]}
                        key={index}
                      >
                        <View
                          style={[
                            {
                              width: 15,
                              height: 15,
                              marginRight: 10,
                              borderRadius: 3,
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "#c4c5c6",
                            },
                            disabledCheckBoxStyles,
                          ]}
                        >
                          {selectedval?.includes(value) ? (
                            <Image
                              key={index}
                              source={require("../../assets/images/check.png")}
                              resizeMode="contain"
                              style={[{ width: 8, height: 8, paddingLeft: 7 }]}
                            />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            { fontFamily, color: "#c4c5c6" },
                            disabledTextStyles,
                          ]}
                        >
                          {value}
                        </Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        style={[styles.option, dropdownItemStyles]}
                        key={index}
                        onPress={() => {
                          let existing = selectedval?.indexOf(value);

                          // console.log(existing);

                          if (existing != -1 && existing != undefined) {
                            let sv = [...selectedval];
                            sv.splice(existing, 1);
                            // setSelectedVal(sv);

                            setSelected((val: any) => {
                              let temp = [...val];
                              temp.splice(existing, 1);
                              return temp;
                            });

                            // onSelect()
                          } else {
                            if (save === "value") {
                              setSelected((val: any) => {
                                let temp = [...new Set([...val, value])];
                                return temp;
                              });
                            } else {
                              setSelected((val: any) => {
                                let temp = [...new Set([...val, key])];
                                return temp;
                              });
                            }

                            // setSelectedVal((val: any) => {
                            //   let temp = [...new Set([...val, value])];
                            //   return temp;
                            // });

                            // onSelect()
                          }
                        }}
                      >
                        <View
                          style={[
                            {
                              width: 15,
                              height: 15,
                              borderWidth: 1,
                              marginRight: 10,
                              borderColor: "gray",
                              borderRadius: 3,
                              justifyContent: "center",
                              alignItems: "center",
                            },
                            checkBoxStyles,
                          ]}
                        >
                          {selectedval?.includes(value) ? (
                            <Image
                              key={index}
                              source={require("../../assets/images/check.png")}
                              resizeMode="contain"
                              style={{ width: 8, height: 8, paddingLeft: 7 }}
                            />
                          ) : null}
                        </View>
                        <Text style={[{ fontFamily }, dropdownTextStyles]}>
                          {value}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                })
              ) : (
                <TouchableOpacity
                  style={[styles.option, dropdownItemStyles]}
                  onPress={() => {
                    setSelected(undefined);
                    setSelectedVal("");
                    slideup();
                    setTimeout(() => setFilteredData(data), 800);
                  }}
                >
                  <Text style={dropdownTextStyles}>{notFoundText}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {selectedval?.length > 0 ? (
              <Pressable>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: 20,
                  }}
                >
                  <Text
                    style={{ marginRight: 20, fontWeight: "600", fontFamily }}
                  >
                    {selectedText}
                  </Text>
                  <View
                    style={{ height: 1, flex: 1, backgroundColor: "gray" }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 20,
                    marginBottom: 20,
                    flexWrap: "wrap",
                  }}
                >
                  {selectedval?.map((item: any, index: number) => {
                    return (
                      <View
                        key={index}
                        style={[
                          {
                            backgroundColor: "gray",
                            paddingHorizontal: 20,
                            paddingVertical: 5,
                            borderRadius: 50,
                            marginRight: 10,
                            marginTop: 10,
                          },
                          badgeStyles,
                        ]}
                      >
                        <Text
                          style={[
                            { color: "white", fontSize: 12, fontFamily },
                            badgeTextStyles,
                          ]}
                        >
                          {item}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
};
export default CustomMultipleSelectList;

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "gray",
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "gray",
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  disabledoption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "whitesmoke",
  },
});
