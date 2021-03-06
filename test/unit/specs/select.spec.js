import { createTest, createVue, triggerEvent, destroyVM } from '../util';
import Select from 'packages/select';

describe('Select', () => {
  const getSelectVm = (configs = {}, options) => {
    ['multiple', 'clearable', 'filterable', 'allowCreate', 'remote', 'collapseTags'].forEach(config => {
      configs[config] = configs[config] || false;
    });
    configs.multipleLimit = configs.multipleLimit || 0;
    if (!options) {
      options = [{
        value: '选项1',
        label: '黄金糕',
        disabled: false
      }, {
        value: '选项2',
        label: '双皮奶',
        disabled: false
      }, {
        value: '选项3',
        label: '蚵仔煎',
        disabled: false
      }, {
        value: '选项4',
        label: '龙须面',
        disabled: false
      }, {
        value: '选项5',
        label: '北京烤鸭',
        disabled: false
      }];
    }
    const vm = createVue({
      template: `
        <div>
          <tm-select
            ref="select"
            v-model="value"
            :multiple="multiple"
            :multiple-limit="multipleLimit"
            :popper-class="popperClass"
            :clearable="clearable"
            :filterable="filterable"
            :collapse-tags="collapseTags"
            :allow-create="allowCreate"
            :filterMethod="filterMethod"
            :remote="remote"
            :loading="loading"
            :remoteMethod="remoteMethod">
            <tm-option
              v-for="item in options"
              :label="item.label"
              :key="item.value"
              :disabled="item.disabled"
              :value="item.value">
            </tm-option>
          </tm-select>
        </div>
      `,

      data() {
        return {
          options,
          multiple: configs.multiple,
          multipleLimit: configs.multipleLimit,
          clearable: configs.clearable,
          filterable: configs.filterable,
          collapseTags: configs.collapseTags,
          allowCreate: configs.allowCreate,
          popperClass: configs.popperClass,
          loading: false,
          filterMethod: configs.filterMethod && configs.filterMethod(this),
          remote: configs.remote,
          remoteMethod: configs.remoteMethod && configs.remoteMethod(this),
          value: configs.multiple ? [] : ''
        };
      }
    }, true);
    return vm;
  };

  let vm;
  afterEach(() => {
    destroyVM(vm);
  });

  it('create', () => {
    vm = createTest(Select, true);
    expect(vm.$el.className.search('tm-select') !== -1).to.true;
    expect(vm.$el.querySelector('.tm-input__inner').placeholder).to.equal('Select');
    vm.toggleMenu();
    expect(vm.visible).to.true;
  });

  it('options rendered correctly', () => {
    vm = getSelectVm();
    const options = vm.$el.querySelectorAll('.tm-select-dropdown__item');
    const result = [].every.call(options, (option, index) => {
      let text = option.querySelector('span').textContent;
      return text === vm.options[index].label;
    });
    expect(result).to.true;
  });

  it('custom dropdown class', () => {
    vm = getSelectVm({ popperClass: 'custom-dropdown' });
    const dropdown = vm.$el.querySelector('.tm-select-dropdown');
    expect(dropdown.classList.contains('custom-dropdown')).to.true;
  });

  it('default value', done => {
    vm = createVue({
      template: `
        <div>
          <tm-select v-model="value">
            <tm-option
              v-for="item in options"
              :label="item.label"
              :key="item.value"
              :value="item.value">
            </tm-option>
          </tm-select>
        </div>
      `,

      data() {
        return {
          options: [{
            value: '选项1',
            label: '黄金糕'
          }, {
            value: '选项2',
            label: '双皮奶'
          }],
          value: '选项2'
        };
      }
    }, true);
    setTimeout(() => {
      expect(vm.$el.querySelector('.tm-input__inner').value).to.equal('双皮奶');
      done();
    }, 100);
  });

  it('single select', done => {
    vm = createVue({
      template: `
        <div>
          <tm-select v-model="value" @change="handleChange">
            <tm-option
              v-for="item in options"
              :label="item.label"
              :key="item.value"
              :value="item.value">
              <p>{{item.label}} {{item.value}}</p>
            </tm-option>
          </tm-select>
        </div>
      `,

      data() {
        return {
          options: [{
            value: '选项1',
            label: '黄金糕'
          }, {
            value: '选项2',
            label: '双皮奶'
          }, {
            value: '选项3',
            label: '蚵仔煎'
          }, {
            value: '选项4',
            label: '龙须面'
          }, {
            value: '选项5',
            label: '北京烤鸭'
          }],
          value: '',
          count: 0
        };
      },

      methods: {
        handleChange() {
          this.count++;
        }
      }
    }, true);
    const options = vm.$el.querySelectorAll('.tm-select-dropdown__item');
    expect(vm.value).to.equal('');
    triggerEvent(options[2], 'mouseenter');
    options[2].click();
    setTimeout(() => {
      expect(vm.value).to.equal('选项3');
      expect(vm.count).to.equal(1);
      triggerEvent(options[2], 'mouseenter');
      options[4].click();
      setTimeout(() => {
        expect(vm.value).to.equal('选项5');
        expect(vm.count).to.equal(2);
        done();
      }, 100);
    }, 100);
  });

  it('disabled option', done => {
    vm = getSelectVm();
    vm.options[1].disabled = true;
    setTimeout(() => {
      const options = vm.$el.querySelectorAll('.tm-select-dropdown__item');
      expect(options[1].classList.contains('is-disabled')).to.true;
      options[1].click();
      setTimeout(() => {
        expect(vm.value).to.equal('');
        done();
      }, 100);
    }, 100);
  });

  it('disabled select', () => {
    vm = createTest(Select, { disabled: true }, true);
    expect(vm.$el.querySelector('.tm-input').classList.contains('is-disabled')).to.true;
  });

  it('visible event', done => {
    vm = createVue({
      template: `
        <div>
          <tm-select v-model="value" @visible-change="handleVisibleChange">
            <tm-option
              v-for="item in options"
              :label="item.label"
              :key="item.value"
              :value="item.value">
            </tm-option>
          </tm-select>
        </div>
      `,

      data() {
        return {
          options: [],
          value: '',
          visible: ''
        };
      },

      methods: {
        handleVisibleChange(val) {
          this.visible = val;
        }
      }
    }, true);
    vm.$children[0].visible = true;
    setTimeout(() => {
      expect(vm.visible).to.true;
      done();
    }, 50);
  });

  it('keyboard operations', done => {
    vm = getSelectVm();
    const select = vm.$children[0];
    let i = 8;
    while (i--) {
      select.navigateOptions('next');
    }
    select.navigateOptions('prev');
    setTimeout(() => {
      expect(select.hoverIndex).to.equal(0);
      select.selectOption();
      setTimeout(() => {
        expect(select.value).to.equal('选项1');
        done();
      }, 100);
    }, 100);
  });

  it('clearable', done => {
    vm = getSelectVm({ clearable: true });
    const select = vm.$children[0];
    vm.value = '选项1';
    select.inputHovering = true;
    setTimeout(() => {
      const icon = vm.$el.querySelector('.tm-input__icon');
      expect(icon.classList.contains('tm-icon--cross')).to.true;
      icon.click();
      expect(vm.value).to.equal('');
      done();
    }, 100);
  });

  it('object typed value', done => {
    vm = createVue({
      template: `
        <div>
          <tm-select v-model="value" value-key="id">
            <tm-option
              v-for="item in options"
              :label="item.label"
              :key="item.id"
              :value="item">
            </tm-option>
          </tm-select>
        </div>
      `,

      data() {
        return {
          options: [{
            id: 1,
            label: 'label1'
          }, {
            id: 2,
            label: 'label2'
          }],
          value: {
            id: 1,
            label: 'label1'
          }
        };
      }
    }, true);
    setTimeout(() => {
      expect(vm.$el.querySelector('.tm-input__inner').value).to.equal('label1');
      expect(vm.$el.querySelector('.tm-select-dropdown__item').classList.contains('selected'));
      done();
    }, 100);
  });

  it('custom tm-option template', () => {
    vm = createVue({
      template: `
        <div>
          <tm-select v-model="value">
            <tm-option
              v-for="item in options"
              :label="item.label"
              :key="item.value"
              :value="item.value">
              <p>{{item.label}} {{item.value}}</p>
            </tm-option>
          </tm-select>
        </div>
      `,

      data() {
        return {
          options: [{
            value: 'value',
            label: 'label'
          }],
          value: ''
        };
      }
    }, true);
    expect(vm.$el.querySelector('.tm-select-dropdown__item p').textContent).to.equal('label value');
  });

  it('option group', () => {
    vm = createVue({
      template: `
        <div>
          <tm-select v-model="value">
            <tm-option-group
              v-for="group in options"
              :key="group.label"
              :disabled="group.disabled"
              :label="group.label">
              <tm-option
                v-for="item in group.options"
                :label="item.label"
                :key="item.value"
                :value="item.value">
              </tm-option>
            </tm-option-group>
          </tm-select>
        </div>
      `,

      data() {
        return {
          options: [{
            label: '热门城市',
            options: [{
              value: 'Shanghai',
              label: '上海'
            }, {
              value: 'Beijing',
              label: '北京'
            }]
          }, {
            label: '城市名',
            disabled: true,
            options: [{
              value: 'Chengdu',
              label: '成都'
            }, {
              value: 'Shenzhen',
              label: '深圳'
            }, {
              value: 'Guangzhou',
              label: '广州'
            }, {
              value: 'Dalian',
              label: '大连'
            }]
          }],
          value: ''
        };
      }
    }, true);
    const groups = vm.$el.querySelectorAll('.tm-select-group__wrap');
    const options = groups[1].querySelectorAll('.tm-select-dropdown__item');
    expect(groups.length).to.equal(2);
    expect(options.length).to.equal(4);
    expect(options[0].querySelector('span').textContent).to.equal('成都');
  });

  it('filterable', done => {
    vm = getSelectVm({ filterable: true });
    const select = vm.$children[0];
    setTimeout(() => {
      select.selectedLabel = '面';
      select.onInputChange();
      select.visible = true;
      setTimeout(() => {
        expect(select.filteredOptionsCount).to.equal(1);
        done();
      }, 10);
    }, 10);
  });

  it('filterable with custom filter-method', done => {
    const filterMethod = vm => {
      return query => {
        vm.options = vm.options.filter(option => option.label.indexOf(query) === -1);
      };
    };
    vm = getSelectVm({ filterable: true, filterMethod });
    const select = vm.$children[0];
    select.$el.querySelector('input').focus();
    setTimeout(() => {
      select.selectedLabel = '面';
      select.onInputChange();
      setTimeout(() => {
        expect(select.filteredOptionsCount).to.equal(4);
        done();
      }, 10);
    }, 10);
  });

  it('default-first-option', done => {
    vm = createVue({
      template: `
        <div>
          <tm-select
            v-model="value"
            default-first-option
            filterable
          >
            <tm-option
              v-for="item in options"
              :label="item"
              :key="item"
              :value="item"
            />
          </tm-select>
        </div>
      `,
      data() {
        return {
          options: ['1', '2', '3', '4', '5'],
          value: ''
        };
      }
    }, true);

    const select = vm.$children[0];
    setTimeout(() => {
      select.$el.querySelector('input').focus();
      select.query = '3';
      select.handleQueryChange('3');
      select.selectOption();
      setTimeout(() => {
        expect(select.value).to.equal('3');
        done();
      }, 10);
    }, 10);
  });

  it('allow create', done => {
    vm = getSelectVm({ filterable: true, allowCreate: true });
    const select = vm.$children[0];
    select.$el.querySelector('input').focus();
    setTimeout(() => {
      select.selectedLabel = 'new';
      select.onInputChange();
      setTimeout(() => {
        const options = document.querySelectorAll('.tm-select-dropdown__item span');
        const target = [].filter.call(options, option => option.innerText === 'new');
        target[0].click();
        setTimeout(() => {
          expect(select.value.indexOf('new') > -1).to.true;
          done();
        }, 10);
      }, 10);
    }, 10);
  });

  it('multiple select', done => {
    vm = getSelectVm({ multiple: true });
    const options = vm.$el.querySelectorAll('.tm-select-dropdown__item');
    vm.value = ['选项1'];
    setTimeout(() => {
      options[1].click();
      setTimeout(() => {
        options[3].click();
        setTimeout(() => {
          expect(vm.value.indexOf('选项2') > -1 && vm.value.indexOf('选项4') > -1).to.true;
          setTimeout(() => {
            expect(vm.value.indexOf('选项1')).to.not.equal(-1);
            done();
          }, 100);
        }, 100);
      }, 100);
    }, 100);
  });

  it('multiple limit', done => {
    vm = getSelectVm({ multiple: true, multipleLimit: 1 });
    const options = vm.$el.querySelectorAll('.tm-select-dropdown__item');
    options[1].click();
    setTimeout(() => {
      expect(vm.value.indexOf('选项2') > -1).to.true;
      options[3].click();
      setTimeout(() => {
        expect(vm.value.indexOf('选项4')).to.equal(-1);
        done();
      }, 50);
    }, 50);
  });

  it('multiple remote search', done => {
    const remoteMethod = vm => {
      return query => {
        vm.loading = true;
        setTimeout(() => {
          vm.options = vm.options.filter(option => {
            return option.label.indexOf(query) > -1;
          });
          vm.loading = false;
        }, 200);
      };
    };
    vm = getSelectVm({
      multiple: true,
      remote: true,
      filterable: true,
      remoteMethod
    });
    const select = vm.$children[0];
    vm.$nextTick(() => {
      select.handleQueryChange('面');
      setTimeout(() => {
        expect(select.filteredOptionsCount).to.equal(1);
        select.options[0].$el.click();
        vm.$nextTick(() => {
          expect(vm.value[0]).to.equal('选项4');
          select.deletePrevTag({ target: select.$refs.input });
          select.deletePrevTag({ target: select.$refs.input });
          select.resetInputState({ keyCode: 1 });
          vm.$nextTick(() => {
            expect(vm.value.length).to.equal(0);
            done();
          });
        });
      }, 250);
    });
  });

  it('event:focus & blur', done => {
    vm = createVue({
      template: `
        <tm-select ref="select"></tm-select>
      `
    }, true);

    const spyFocus = sinon.spy();
    const spyBlur = sinon.spy();

    vm.$refs.select.$on('focus', spyFocus);
    vm.$refs.select.$on('blur', spyBlur);
    vm.$el.querySelector('input').focus();
    vm.$el.querySelector('input').blur();

    vm.$nextTick(() => {
      expect(spyFocus.calledOnce).to.be.true;
      expect(spyBlur.calledOnce).to.be.true;
      done();
    });
  });

  it('focus', done => {
    vm = createVue({
      template: `
        <tm-select ref="select"></tm-select>
      `
    }, true);
    const spy = sinon.spy();

    vm.$refs.select.$on('focus', spy);
    vm.$refs.select.focus();

    vm.$nextTick(() => {
      expect(spy.calledOnce).to.be.true;
      done();
    });
  });

  it('only emit change on user input', done => {
    let callCount = 0;
    vm = createVue({
      template: `
        <div>
          <tm-select v-model="value" @change="change" ref="select">
            <tm-option label="1" :value="1" />
            <tm-option label="2" :value="2" />
            <tm-option label="3" :value="3" />
          </tm-select>
        </div>
      `,
      data() {
        return {
          value: 1,
          change: () => ++callCount
        };
      }
    });

    vm.value = 2;
    setTimeout(() => {
      expect(callCount).to.equal(0);
      const options = vm.$el.querySelectorAll('.tm-select-dropdown__item');
      triggerEvent(options[2], 'mouseenter');
      options[2].click();
      setTimeout(() => {
        expect(callCount).to.equal(1);
        done();
      }, 10);
    }, 10);
  });

  describe('resetInputHeight', () => {
    const getSelectComponentVm = (configs) => {
      vm = getSelectVm(configs || {});
      return vm.$refs.select;
    };

    it('should reset height if collapse-tags option is disabled', () => {
      const select = getSelectComponentVm();
      sinon.stub(select, '$nextTick');
      select.resetInputHeight();
      expect(select.$nextTick.callCount).to.equal(1);
    });

    it('should not reset height if collapse-tags option is enabled', () => {
      const select = getSelectComponentVm({ collapseTags: true });
      sinon.stub(select, '$nextTick');
      select.resetInputHeight();
      expect(select.$nextTick.callCount).to.equal(0);
    });

    it('should reset height if both collapse-tags and filterable are enabled', () => {
      const select = getSelectComponentVm({ collapseTags: true, filterable: true });
      sinon.stub(select, '$nextTick');
      select.resetInputHeight();
      expect(select.$nextTick.callCount).to.equal(1);
    });
  });
});
