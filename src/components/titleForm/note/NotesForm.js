import React, {Component} from "react";
import {ScrollView, View} from "react-native";
import {Divider, IconButton, TextInput, Title, withTheme} from "react-native-paper";
import {styles} from "src/Style/app.style";


class NotesForm extends Component {

    constructor(props) {
        super(props);
        this.title = this.props.navigation.getParam('title');
        this.state = {
            tmpTitle: {...this.title},
            saveFlag:0
        };
    }

    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;
        return {
            headerRight: (
                <IconButton
                    icon="check" color="white" size={25}
                    onPress={() => params.saveForm()}
                />
            )
        }
    };

    saveForm() {
        let {saveFlag} = this.state;
        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            let onSave = this.props.navigation.getParam('onChangeValue');
            onSave(this.state.tmpTitle);
            this.props.navigation.goBack();
        }
    };

    componentDidMount() {
        this.props.navigation.setParams({saveForm: this.saveForm.bind(this)});
    }

    render() {
        let {tmpTitle} = this.state;
        return (
            <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                <View style={ styles.container }>
                    <View style={[{flexDirection: 'row', justifyContent: 'space-between'}]}>
                        <Title style={styles.title}>
                            Notes
                        </Title>

                    </View>
                    <Divider style={styles.divideForm}/>
                    <View style={styles.formRow}>
                        <TextInput
                            mode="outlined"
                            multiline={true}
                            numberOfLines={4}
                            value={tmpTitle.note}
                            style={{flex: 1}}
                            onChangeText={ (note) => {
                                tmpTitle.note = note;
                                this.setState({tmpTitle: tmpTitle});
                            }}
                        >
                        </TextInput>
                    </View>
                </View>
            </ScrollView>
        );
    }
}

export default withTheme(NotesForm);