/*Screen to view all the user*/
import React from 'react';
import { ListView, Text, View } from 'react-native';

export default class ViewAllUser extends React.Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    var user_details = {};
    this.state = {
      dataSource: ds.cloneWithRows(user_details),
    };
  }
  ListViewItemSeparator = () => {
    return (
      <View style={{ height: 0.5, width: '100%', backgroundColor: '#000' }} />
    );
  };
  render() {
    return (
      <View>
        <ListView
          dataSource={this.state.dataSource}
          renderSeparator={this.ListViewItemSeparator}
          renderRow={rowData => (
            <View style={{ backgroundColor: 'white', padding: 20 }}>
              <Text>Id: {rowData.user_id}</Text>
              <Text>Name: {rowData.user_name}</Text>
              <Text>Contact: {rowData.user_contact}</Text>
              <Text>Address: {rowData.user_address}</Text>
            </View>
          )}
        />
      </View>
    );
  }
}
